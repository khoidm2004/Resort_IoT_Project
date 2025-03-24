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
  const eventSource = new EventSource('http://8.215.20.85/sse/get-relay-status');

  eventSource.onopen = () => {
    //console.log('EventSource connection for Relay status opened.');
  };

  eventSource.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data);
      callback({ relayStatus: parsedData.status });
      console.log('Received Relay status:', parsedData);
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
    console.log('Relay Status EventSource connection closed.');
  };
};

export const updateRelayWithSSEHandling = async (status) => {
  stopSSE();

  try {
    const response = await axios.get('http://8.215.20.85/api/v1/update-relay-status', {
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