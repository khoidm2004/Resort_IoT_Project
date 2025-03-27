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

  eventSource.onopen = () => {};

  eventSource.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data);
      callback({ ledStatus: parsedData.status });
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
  };
};

export const updateLedWithSSEHandling = async (status) => {
  stopSSE();

  try {
    const response = await axios.get('https://thong123.work.gd/api/v1/update-led-status', {
      params: { status },
      timeout: 5000
    });
    return response.data;
  } finally {
    setTimeout(() => {
      startSSE();
    }, 1000); 
  }
};
