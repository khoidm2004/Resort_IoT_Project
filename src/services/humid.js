export const getHumid = (callback) => {
  const eventSource = new EventSource('https://thong123.work.gd/api/v1/get-hum'); 

  eventSource.onopen = () => {};

  eventSource.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data); 
      const sortedData = parsedData.sort((a, b) => new Date(b.time) - new Date(a.time)); 

      callback({ humid: sortedData });
    } catch (e) {
      console.error('Failed to parse humidity data:', e);
      callback({ humid: null }); 
    }
  };

  eventSource.onerror = (error) => {
    console.error('Humidity EventSource failed:', error);
    eventSource.close(); 
    callback({ humid: null });
  };

  return () => {
    eventSource.close();
  };
};
