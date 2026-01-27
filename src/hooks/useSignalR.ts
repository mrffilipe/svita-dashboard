import { useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import type { RequestDto } from '../types';

const SIGNALR_BASE_URL = import.meta.env.VITE_SIGNALR_HUB_URL?.replace('/hubs/requests', '') || 'http://localhost:5000';

const getAccessToken = (): string | null => {
  const authSession = localStorage.getItem('authSession');
  if (authSession) {
    const { accessToken } = JSON.parse(authSession);
    return accessToken;
  }
  return null;
};

const buildHubUrl = (tenantKey: string): string => {
  return `${SIGNALR_BASE_URL}/hubs/tenants/${tenantKey}/requests`;
};

export const useSignalR = (tenantKey: string | null) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [requests, setRequests] = useState<RequestDto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantKey) {
      return;
    }

    const hubUrl = buildHubUrl(tenantKey);
    
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        withCredentials: false,
        accessTokenFactory: () => {
          const token = getAccessToken();
          if (!token) {
            throw new Error('No access token available');
          }
          return token;
        },
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Se o erro for 401, tentar reconectar após um tempo maior
          if (retryContext.previousRetryCount > 3) {
            return 10000; // 10 segundos
          }
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.stop();
      }
    };
  }, [tenantKey]);

  useEffect(() => {
    if (!connection) {
      return;
    }

    const startConnection = async () => {
      try {
        await connection.start();
        console.log('SignalR Connected');
        
        // Invocar SubscribeRegistered para começar a receber requests
        await connection.invoke('SubscribeRegistered');
        console.log('Subscribed to registered requests');
        
        setIsConnected(true);
        setError(null);
      } catch (err: any) {
        console.error('SignalR Connection Error:', err);
        
        // Se o erro for 401, tentar renovar o token e reconectar
        if (err.message?.includes('401') || (err as any).statusCode === 401) {
          console.log('Token expired, attempting to refresh...');
          // O axios interceptor já cuida da renovação do token
          // A reconexão automática tentará novamente com o novo token
          setError('Sessão expirada. Tentando reconectar...');
        } else {
          setError('Erro ao conectar ao servidor em tempo real');
        }
        
        setIsConnected(false);
      }
    };

    startConnection();

    connection.on('RequestsRegisteredUpdated', (updatedRequests: RequestDto[]) => {
      console.log('Received RequestsRegisteredUpdated:', updatedRequests);
      setRequests(updatedRequests);
    });

    connection.onreconnecting((error) => {
      console.log('SignalR Reconnecting...', error);
      setIsConnected(false);
      
      // Se a reconexão for por erro de autenticação
      if (error && (error.message?.includes('401') || (error as any).statusCode === 401)) {
        setError('Autenticação expirada. Reconectando...');
      }
    });

    connection.onreconnected((connectionId) => {
      console.log('SignalR Reconnected with connectionId:', connectionId);
      setIsConnected(true);
      setError(null);
      
      // Reinscrever após reconexão
      connection.invoke('SubscribeRegistered')
        .then(() => console.log('Resubscribed to registered requests after reconnection'))
        .catch(err => console.error('Error resubscribing:', err));
    });

    connection.onclose((error) => {
      console.log('SignalR Disconnected', error);
      setIsConnected(false);
      
      if (error && (error.message?.includes('401') || (error as any).statusCode === 401)) {
        setError('Conexão encerrada: autenticação expirada');
      }
    });

    return () => {
      connection.off('RequestsRegisteredUpdated');
      connection.off('reconnecting');
      connection.off('reconnected');
      connection.off('close');
    };
  }, [connection]);

  const disconnect = useCallback(() => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      connection.stop();
    }
  }, [connection]);

  const refresh = useCallback(async () => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke('SubscribeRegistered');
        console.log('Refreshed registered requests');
      } catch (err) {
        console.error('Error refreshing requests:', err);
      }
    }
  }, [connection]);

  const reconnectWithNewTenant = useCallback(async (newTenantKey: string) => {
    if (connection) {
      await connection.stop();
    }
    // O useEffect com tenantKey dependency vai criar uma nova conexão
    console.log(`Switching to tenant: ${newTenantKey}`);
  }, [connection]);

  return {
    requests,
    isConnected,
    error,
    disconnect,
    refresh,
    reconnectWithNewTenant,
  };
};
