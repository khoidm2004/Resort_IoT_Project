import axios from 'axios';

let closeSSE = null;

export const startSSE = (callback) => {
  closeSSE = getRelayStatus(callback);
};

export const stopSSE = () => {
  if (closeSSE) {
    closeSSE();  
    closeSSE = null;
  }
};

export const getRelayStatus = (callback) => {
  const eventSource = new EventSource('https://thong123.work.gd/sse/get-relay-status');

  eventSource.onopen = () => {
  };

  eventSource.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data);
      callback({ relayStatus: parsedData.status });
    } catch (e) {
      console.error('Failed to parse Relay status data:', e);
      callback({ relayStatus: null });
    }
  };

  eventSource.onerror = (error) => {
    console.error('Relay Status EventSource failed:', error);
    eventSource.close();
    callback({ relayStatus: null });
  };

  return () => {
    eventSource.close();
  };
};

export const updateRelayWithSSEHandling = async (status) => {
  stopSSE();

  try {
    const response = await axios.get('https://thong123.work.gd/api/v1/update-relay-status', {
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