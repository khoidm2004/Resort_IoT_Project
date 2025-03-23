import express from 'express';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import cors from 'cors';
import { getEnvs } from './envs.mjs';
import winston from 'winston';
import fs from 'fs';
import admin_router from './Admin_route.mjs';
import user_router from './User_route.mjs';
import info_router from './Info_route.mjs';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from "axios";
import 'dotenv/config';
// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'service-account.json'), // Path to your service account key file
});
const bucketName = 'image_resort_project'; // Replace with your Google Cloud Storage bucket name
const bucket = storage.bucket(bucketName);

// Initialize Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// 1. Initialize
const ENV = getEnvs();
console.log({ ENV });
const app = express();
app.use(cors());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'app.log', // Outputs logs to the console and a file named app.log
    }),
  ],
});

const DB_CLIENT = new InfluxDB({
  url: ENV.INFLUX.HOST,
  token: ENV.INFLUX.TOKEN,
});
const DB_WRITE_POINT = DB_CLIENT.getWriteApi(ENV.INFLUX.ORG, ENV.INFLUX.BUCKET);
DB_WRITE_POINT.useDefaultTags({ app: 'query-param-app' });

// admin route
app.use('/admin', admin_router);

// user route
app.use('/user', user_router);

// info route
app.use('/info',info_router);

// Endpoint - Update LED status in InfluxDB
app.get('/api/v1/update-led-status', async (req, res) => {
  const { status } = req.query;

  if (status !== 'on' && status !== 'off') {
    res.status(400).send("Invalid status. Must be 'on' or 'off'.");
    logger.error({ statusCode: 400, message: 'Invalid LED status', timestamp: new Date().toISOString() });
    return;
  }

  const numericStatus = status === 'on' ? 1 : 0; // Convert to 1 (on) or 0 (off)

  try {
    const pointLEDStatus = new Point('led_status').intField('status', numericStatus); // No tag

    DB_WRITE_POINT.writePoint(pointLEDStatus);
    await DB_WRITE_POINT.flush();

    res.send(`LED status ${status}`);
    logger.info({ statusCode: 200, message: `LED status updated to ${status}`, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error writing data to InfluxDB');
    logger.error({ statusCode: 500, message: 'Error writing data to InfluxDB', timestamp: new Date().toISOString(), error: err.message });
  }
});

// Endpoint - Get LED status from InfluxDB
app.get('/api/v1/get-led-status', async (req, res) => {
  try {
    const query = `
      from(bucket: "${ENV.INFLUX.BUCKET}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "led_status")
      |> filter(fn: (r) => r._field == "status")
      |> last()
    `;

    const results = [];
    const DB_READ_API = DB_CLIENT.getQueryApi(ENV.INFLUX.ORG);

    await DB_READ_API.queryRows(query, {
      next(row, tableMeta) {
        const data = tableMeta.toObject(row);
        results.push(data);
      },
      error(error) {
        console.error('Query Error:', error);
        res.status(500).send('Error fetching LED status');
      },
      complete() {
        if (results.length === 0) {
          res.status(404).send('LED status not found');
        } else {
          const ledStatus = results[0]._value;
          res.json({ status: ledStatus === 1 ? 'on' : 'off' });
        }
      },
    });
  } catch (err) {
    console.error('Unexpected Error:', err);
    res.status(500).send('Error fetching LED status');
  }
});

// Endpoint - Record temperature to InfluxDB
app.get('/api/v1/embed-temperature', async (req, res) => {
  const { temperature } = req.query;

  if (!temperature) {
    res.status(400).send('Missing temperature');
    logger.error({ statusCode: 400, message: 'Missing temperature', timestamp: new Date().toISOString() });
    return;
  }

  const numeric_temperature = parseFloat(temperature);

  if (isNaN(numeric_temperature)) {
    res.status(400).send('Invalid values.');
    logger.error({ statusCode: 400, message: 'Invalid temperature value', timestamp: new Date().toISOString() });
    return;
  }

  try {
    const pointTemperature = new Point('qparams').floatField('temperature', numeric_temperature);

    DB_WRITE_POINT.writePoint(pointTemperature);
    await DB_WRITE_POINT.flush();

    res.send(`Temperature: ${temperature}`);
    logger.info({ statusCode: 200, message: 'Temperature recorded and uid recorded', timestamp: new Date().toISOString() });   
  } catch (err) {
    console.error(err);
    res.status(500).send('Error writing data to InfluxDB');
    logger.error({ statusCode: 500, message: 'Error writing data to InfluxDB', timestamp: new Date().toISOString(), error: err.message });
  }
});

// Endpoint - Record humidity to InfluxDB
app.get('/api/v1/embed-humidity', async (req, res) => {
  const { humidity } = req.query;

  if (!humidity) {
    res.status(400).send('Missing humidity');
    logger.error({ statusCode: 400, message: 'Missing humidity', timestamp: new Date().toISOString() });
    return;
  }

  const numeric_humidity = parseFloat(humidity);

  if (isNaN(numeric_humidity)) {
    res.status(400).send('Invalid values.');
    logger.error({ statusCode: 400, message: 'Invalid humidity value', timestamp: new Date().toISOString() });
    return;
  }

  try {
    const pointHumidity = new Point('qparams').floatField('humidity', numeric_humidity);

    DB_WRITE_POINT.writePoint(pointHumidity);
    await DB_WRITE_POINT.flush();

    res.send(`Humidity: ${humidity}`);
    logger.info({ statusCode: 200, message: 'Humidity recorded', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error writing data to InfluxDB');
    logger.error({ statusCode: 500, message: 'Error writing data to InfluxDB', timestamp: new Date().toISOString(), error: err.message });
  }
});

// Endpoint - Get Temperature from InfluxDB
app.get('/api/v1/get-tem', async (req, res) => {
  res.set('Content-Type', 'text/event-stream');
  res.set('Cache-Control', 'no-cache');
  res.set('Connection', 'keep-alive');
  const query = `
    from(bucket: "${ENV.INFLUX.BUCKET}")
    |> range(start: -30d)
    |> filter(fn: (r) => r._measurement == "qparams")
    |> filter(fn: (r) => r._field == "temperature")
  `;
  const interval =  setInterval(async () => {

      try {
        const results = {};
        const DB_READ_API = DB_CLIENT.getQueryApi(ENV.INFLUX.ORG);

        await DB_READ_API.queryRows(query, {
          next(row, tableMeta) {
            const data = tableMeta.toObject(row);
            const time = data._time;

            if (!results[time]) {
              results[time] = { time };
            }

            results[time][data._field] = data._value;
          },
          error(error) {
            console.error('Error during query:', error);
            res.write('data: "Error fetching data from InfluxDB,error 500"\n\n');
            logger.error({ statusCode: 500, message: 'Error fetching data from InfluxDB', timestamp: new Date().toISOString(), error: error.message });
          },
          complete() {
            const formattedResults = Object.values(results);
            if (formattedResults.length === 0) {
              res.write('data: "No data found,error 404"\n\n');
              logger.info({ statusCode: 404, message: 'No temperature data found', timestamp: new Date().toISOString() });     
            } else {
              res.write(`data: ${JSON.stringify(formattedResults)}\n\n`);
              logger.info({ statusCode: 200, message: 'Temperature data fetched successfully', timestamp: new Date().toISOString() });
            }
          },
        });
      } catch (err) {
        console.error('Error in /get-tem route:', err);
        res.write('data: "Error fetching data from InfluxDB"\n\n');
        logger.error({ statusCode: 500, message: 'Error fetching data from InfluxDB', timestamp: new Date().toISOString(), error: err.message });
      }
    }, 1500);
    req.on('close', () => {
      clearInterval(interval);
      console.log('Client connection closed.');
    });
});

// Endpoint - Get Humidity from InfluxDB
app.get('/api/v1/get-hum', async (req, res) => {
  res.set('Content-Type', 'text/event-stream');
  res.set('Cache-Control', 'no-cache');
  res.set('Connection', 'keep-alive');

  const query = `
    from(bucket: "${ENV.INFLUX.BUCKET}")
    |> range(start: -30d)
    |> filter(fn: (r) => r._measurement == "qparams")
    |> filter(fn: (r) => r._field == "humidity")
  `;
  const interval =  setInterval(async () => {
    try {
      const results = {};
      const DB_READ_API = DB_CLIENT.getQueryApi(ENV.INFLUX.ORG);

      await DB_READ_API.queryRows(query, {
        next(row, tableMeta) {
          const data = tableMeta.toObject(row);
          const time = data._time;
          if (!results[time]) {
            results[time] = { time };
          }
          results[time][data._field] = data._value;
        },

        error(error) {
          console.error('Error during query:', error);
          res.write('data: "Error fetching data from InfluxDB,error 500"\n\n');
          logger.error({statusCode: 500,message: 'Error fetching data from InfluxDB',timestamp: new Date().toISOString(),error: error.message,
          });
        },

        complete() {
          const formattedResults = Object.values(results);

          if (formattedResults.length === 0) {
            res.write('data: "No data found,error 404"\n\n');
            logger.info({statusCode: 404,message: 'No humidity data found',timestamp: new Date().toISOString(),
            });
          } else {
            res.write(`data: ${JSON.stringify(formattedResults)}\n\n`);
            logger.info({statusCode: 200,message: 'Humidity data fetched successfully',timestamp: new Date().toISOString(),    
            });
          }
        },
      });
    } catch (err) {
      console.error('Error in /get-hum route:', err);
      res.write('data: "Error fetching data from InfluxDB"\n\n');
      logger.error({statusCode: 500,message: 'Error fetching data from InfluxDB',timestamp: new Date().toISOString(),error: err.message,
      });
    }
  }, 1500);
  req.on('close', () => {
    clearInterval(interval);
    console.log('Client connection closed.');
  });
});


// Endpoint - upload image to Google cloud Storage
app.post('/api/v1/upload', upload.single('image'), async (req, res) => {
  const {uid} = req.body;
  if (!uid) {
    return res.status(400).send('No uid');
  }
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const style_of_image = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!style_of_image.includes(req.file.mimetype)) {
    logger.error({ statusCode: 400, message: `type of file is invalid`, timestamp: new Date().toISOString() });
    return res.status(400).send('Only image files are allowed (jpeg, png, gif, webp).');
  }
  try {
    const [files] = await bucket.getFiles({ prefix: uid });
    const file = files.find(f => f.name.startsWith(uid + '.'));
    if (file) {
      await file.delete();
      console.log(`Deleted old file: ${file.name}`);
    }
    const file_extension = path.extname(req.file.originalname).toLowerCase();
    const file_folder_name = bucket.file(`${uid}${file_extension}`);

    const createStream = file_folder_name.createWriteStream({
      resumable: false,
    });
    createStream.on('error', (err) => {
      console.error(err);
      res.status(500).send('Error uploading file.');
      logger.error({ statusCode: 500, message: 'Error uploading file', timestamp: new Date().toISOString(), error: err.message });
    });

    createStream.on('finish', () => {
      const publicUrl = `https://storage.cloud.google.com/${bucketName}/${file_folder_name.name}`;
      res.status(200).send(`File uploaded successfully: ${publicUrl}`);
      logger.info({ statusCode: 200, message: `File uploaded successfully: ${publicUrl}`, timestamp: new Date().toISOString() });
    });

    createStream.end(req.file.buffer);
  } catch (err) {
    console.error('Error  file upload:', err);
    res.status(500).send('Error file upload.');
  }
});

// Endpoint - upload file txt to Google cloud Storage
app.post('/api/v1/update_frequency', upload.single('txt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const style_of_file = ['text/plain'];
  if (!style_of_file.includes(req.file.mimetype)) {
    logger.error({ statusCode: 400, message: `type of file is invalid`, timestamp: new Date().toISOString() });
    return res.status(400).send('Only txt file is allowed.');
  }

  try {
    const file = bucket.file('frequency.txt');
    let oldContent = '';

    const [exists] = await file.exists();
    if (exists) {
      const [buffer] = await file.download();
      oldContent = buffer.toString('utf-8');
      const writeStream = file.createWriteStream({
        resumable: false,
        contentType: 'text/plain',
      });
      writeStream.write(oldContent + '\n' + req.file.buffer.toString());
      writeStream .on('error', (err) => {
        console.error(err);
        res.status(500).send('Error uploading file.');
        logger.error({ statusCode: 500, message: 'Error uploading file', timestamp: new Date().toISOString(), error: err.message });
      });

      writeStream .on('finish', () => {
        const publicUrl = `https://storage.cloud.google.com/${bucketName}/frequency.txt`;
        res.status(200).send(`File uploaded successfully: ${publicUrl}`);
        logger.info({ statusCode: 200, message: `File uploaded successfully: ${publicUrl}`, timestamp: new Date().toISOString() });
      });
      writeStream .end();
    } else {
      const writeStream = file.createWriteStream({
        resumable: false,
        contentType: 'text/plain',
      });
      writeStream.write(req.file.buffer.toString());
      writeStream.on('error', (err) => {
        console.error(err);
        res.status(500).send('Error uploading file.');
        logger.error({ statusCode: 500, message: 'Error uploading file', timestamp: new Date().toISOString(), error: err.message });
      });

      writeStream .on('finish', () => {
        const publicUrl = `https://storage.cloud.google.com/${bucketName}/frequency.txt`;
        res.status(200).send(`File uploaded successfully: ${publicUrl}`);
        logger.info({ statusCode: 200, message: `File uploaded successfully: ${publicUrl}`, timestamp: new Date().toISOString() });
      });
      writeStream.end();
    }
  } catch (err) {
    console.error('Error updating file:', err);
    res.status(500).send('Error updating file.');
  }
});

// Endpoint - getget image from Google cloud Storage
app.get('/api/v1/image/:uid', async (req, res) => {
  const { uid } = req.params;
  if (!uid) {
    return res.status(400).send('No uid');
  }
  try {
    const [files] = await bucket.getFiles({ prefix: uid });
    const file = files.find(f => f.name.startsWith(uid + '.'));
    if (!file) {
      return res.status(404).send('File not found');
    }
    res.setHeader('Content-Type', file.metadata.contentType);
    file.createReadStream().pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

// Endpoint - Update relay status in InfluxDB
app.get('/api/v1/update-relay-status', async (req, res) => {
  const { status } = req.query;

  if (status !== 'on' && status !== 'off') {
    res.status(400).send("Invalid status. Must be 'on' or 'off'.");
    logger.error({ statusCode: 400, message: 'Invalid Relay status', timestamp: new Date().toISOString() });
    return;
  }

  const numericStatus = status === 'on' ? 1 : 0; // Convert to 1 (on) or 0 (off)

  try {
    const pointLEDStatus = new Point('relay_status').intField('status', numericStatus);

    DB_WRITE_POINT.writePoint(pointLEDStatus);
    await DB_WRITE_POINT.flush();

    res.send(`Relay status ${status}`);
    logger.info({ statusCode: 200, message: `Relay status updated to ${status}`, timestamp: new Date().toISOString() });       
  } catch (err) {
    console.error(err);
    res.status(500).send('Error writing data to InfluxDB');
    logger.error({ statusCode: 500, message: 'Error writing data to InfluxDB', timestamp: new Date().toISOString(), error: err.message });
  }
});

// Endpoint - Get relay status from InfluxDB
app.get('/api/v1/get-relay-status', async (req, res) => {
  try {
    const query = `
      from(bucket: "${ENV.INFLUX.BUCKET}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "relay_status")
      |> filter(fn: (r) => r._field == "status")
      |> last()
    `;

    const results = [];
    const DB_READ_API = DB_CLIENT.getQueryApi(ENV.INFLUX.ORG);

    await DB_READ_API.queryRows(query, {
      next(row, tableMeta) {
        const data = tableMeta.toObject(row);
        results.push(data);
      },
      error(error) {
        console.error('Query Error:', error);
        res.status(500).send('Error fetching relay status');
      },
      complete() {
        if (results.length === 0) {
          res.status(404).send('Relay status not found');
        } else {
          const ledStatus = results[0]._value;
          res.json({ status: ledStatus === 1 ? 'on' : 'off' });
        }
      },
    });
  } catch (err) {
    console.error('Unexpected Error:', err);
    res.status(500).send('Error fetching relay status');
  }
});

app.get('/info/weather', async (req, res) => {
  const { city } = req.query;

  try {
    const apiKey = process.env.TOMORROW_API_KEY;
    const originalUrl = `https://api.tomorrow.io/v4/weather/forecast?location=${city}&timesteps=1h&apikey=${apiKey}`;

    const response = await axios.get(originalUrl, {
      timeout: 60000
    });

    const data = response.data;

    const newContent = data.timelines.hourly.map(item => ({
      time: item.time,
      temperature: item.values.temperature,
      windSpeed: item.values.windSpeed,
      humidity: item.values.humidity,
      temperatureApparent: item.values.temperatureApparent,
      weather: weatherType(item.values.weatherCode),
      uvIndex: uvType(item.values.uvIndex),
    }));

    function weatherType(weatherCode) {
      switch (weatherCode) {
        case 0: return 'Unknown';
        case 1000: return 'Clear, Sunny';
        case 1100: return 'Mostly Clear';
        case 1101: return 'Partly Cloudy';
        case 1102: return 'Mostly Cloudy';
        case 1001: return 'Cloudy';
        case 2000: return 'Fog';
        case 2100: return 'Light Fog';
        case 4000: return 'Drizzle';
        case 4001: return 'Rain';
        case 4200: return 'Light Rain';
        case 4201: return 'Heavy Rain';
        case 5000: return 'Snow';
        case 5001: return 'Flurries';
        case 5100: return 'Light Snow';
        case 5101: return 'Heavy Snow';
        case 6000: return 'Freezing Drizzle';
        case 6001: return 'Freezing Rain';
        case 6200: return 'Light Freezing Rain';
        case 6201: return 'Heavy Freezing Rain';
        case 7000: return 'Ice Pellets';
        case 7101: return 'Heavy Ice Pellets';
        case 7102: return 'Light Ice Pellets';
        case 8000: return 'Thunderstorm';
        default: return 'Unknown';
      }
    }

    function uvType(uvIndex) {
      if (uvIndex <= 2) return 'Low';
      if (uvIndex <= 5) return 'Moderate';
      if (uvIndex <= 7) return 'High';
      if (uvIndex <= 10) return 'Very High';
      return 'Extreme';
    }

    res.json({ newContent });

  } catch (err) {
    console.error('Error fetching weather data:', err);
    res.status(500).json({ error: 'Error fetching data from API' });
  }
});


// Endpoint - Get logs
app.get('/api/v1/logs', (req, res) => {
  const logEntries = [];
  try {
    const data = fs.readFileSync('app.log', 'utf8');
    logEntries.push(...data.split('\n'));
    res.send(logEntries);
  } catch (err) {
    console.error('Error reading log file:', err);
    res.status(500).send('Error retrieving logs');
    logger.error({ statusCode: 500, message: 'Error retrieving logs', timestamp: new Date().toISOString(), error: err.message });
  }
});

// 2. Start server
app.listen(ENV.PORT, ENV.HOST, () => {
  console.log(`Listening at http://${ENV.HOST}:${ENV.PORT}`);
});
