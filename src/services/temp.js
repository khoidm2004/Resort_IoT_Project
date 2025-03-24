export const getTemp = (callback) => {
  const eventSource = new EventSource('http://8.215.20.85/api/v1/get-tem'); 

  eventSource.onopen = () => {
    //console.log('EventSource connection for Temperature opened.');
  };

  eventSource.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data); 
      const sortedData = parsedData.sort((a, b) => new Date(b.time) - new Date(a.time)); 
      //console.log('Sorted Temperature Data:', sortedData);

      callback({ temp: sortedData });

    } catch (e) {
      console.error('Failed to parse temperature data:', e);
      callback({ temp: null }); 
    }
  };

  eventSource.onerror = (error) => {
    console.error('Temperature EventSource failed:', error);
    eventSource.close(); 
    callback({ temp: null });
  };

  return () => {
    eventSource.close();
    console.log('Temperature EventSource connection closed.');
  };
};
