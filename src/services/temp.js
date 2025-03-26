export const getTemp = (callback) => {
  const eventSource = new EventSource('https://thong123.work.gd/api/v1/get-tem'); 

  eventSource.onopen = () => {};

  eventSource.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data); 
      const sortedData = parsedData.sort((a, b) => new Date(b.time) - new Date(a.time)); 

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
  };
};
