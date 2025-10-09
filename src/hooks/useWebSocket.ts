import { useEffect, useState, useRef } from 'react';

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('✅ WebSocket connected');
          setIsConnected(true);
          setConnectionError(null);
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('📨 Received:', data);
          
          // Handle different message types
          if (data.type === 'connection') {
            console.log('Connection confirmed:', data);
          }
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          setConnectionError('Connection error');
        };

        ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          setIsConnected(false);
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connect();
          }, 3000);
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        setConnectionError('Failed to establish connection');
        setIsConnected(false);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  return { isConnected, connectionError, ws: wsRef.current };
};