import axios from 'axios';

let closeSSE = null;

export const startSSE = (callback) => {
  closeSSE = getLedStatus(callback);
};

export const stopSSE = () => {
  if (closeSSE) {
    closeSSE(); 
    closeSSE = null;
  }
};

export const getLedStatus = (callback) => {
  const eventSource = new EventSource('https://thong123.work.gd/sse/get-led-status');

  eventSource.onopen = () => {
    //console.log('EventSource connection for LED status opened.');
  };

  eventSource.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data);
      callback({ ledStatus: parsedData.status });
      console.log('Received LED status:', parsedData);
    } catch (e) {
      console.error('Failed to parse LED status data:', e);
      callback({ ledStatus: null });
    }
  };

  eventSource.onerror = (error) => {
    console.error('LED Status EventSource failed:', error);
    eventSource.close();
    callback({ ledStatus: null });
  };

  return () => {
    eventSource.close();
    console.log('LED Status EventSource connection closed.');
  };
};

export const updateLedWithSSEHandling = async (status) => {
  stopSSE();

  try {
    const response = await axios.get('https://thong123.work.gd/api/v1/update-led-status', {
      params: { status },
      timeout: 5000
    });
    console.log('API response:', response.data);
    return response.data;
  } finally {
    setTimeout(() => {
      startSSE((data) => console.log('SSE restarted:', data));
    }, 1000); 
  }
};
