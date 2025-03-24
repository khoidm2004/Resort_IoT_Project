export const getHumid = (callback) => {
  const eventSource = new EventSource('http://8.215.20.85/api/v1/get-hum'); 

  eventSource.onopen = () => {
    //console.log('EventSource connection for Humidity opened.');
  };

  eventSource.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data); 
      const sortedData = parsedData.sort((a, b) => new Date(b.time) - new Date(a.time)); 
      //console.log('Sorted Humidity Data:', sortedData);

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
    console.log('Humidity EventSource connection closed.');
  };
};
