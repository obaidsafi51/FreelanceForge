import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNetworkInfo, freelanceForgeAPI } from '../utils/api';
import { useNotifications, NotificationTemplates } from '../components/NotificationSystem';
import { useErrorHandler } from './useErrorHandler';

interface NetworkStatus {
  isConnected: boolean;
  isConnecting: boolean;
  network: string;
  endpoint: string;
  chainName?: string;
  nodeVersion?: string;
  lastConnected?: Date;
  connectionAttempts: number;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: false,
    isConnecting: false,
    network: 'unknown',
    endpoint: '',
    connectionAttempts: 0,
  });

  const { addNotification } = useNotifications();
  const { handleNetworkError } = useErrorHandler();

  // Query network info with automatic retries
  const {
    data: networkInfo,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['networkInfo'],
    queryFn: getNetworkInfo,
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount < 3) {
        console.log(`Network connection attempt ${failureCount + 1}/3`);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchInterval: (data) => {
      // Refetch every 30 seconds if connected, every 5 seconds if not
      return data && 'isConnected' in data && data.isConnected ? 30000 : 5000;
    },
    refetchIntervalInBackground: true,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Update status when network info changes
  useEffect(() => {
    if (networkInfo) {
      setStatus(prev => ({
        ...prev,
        isConnected: networkInfo.isConnected,
        isConnecting: false,
        network: networkInfo.network,
        endpoint: networkInfo.endpoint,
        chainName: networkInfo.chainName,
        nodeVersion: networkInfo.nodeVersion,
        lastConnected: networkInfo.isConnected ? new Date() : prev.lastConnected,
      }));

      // Show connection success notification (only once per session)
      if (networkInfo.isConnected && !status.isConnected) {
        addNotification(NotificationTemplates.networkConnected(
          networkInfo.network,
          networkInfo.endpoint
        ));
      }
    }
  }, [networkInfo, addNotification, status.isConnected]);

  // Handle connection errors
  useEffect(() => {
    if (error) {
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        connectionAttempts: prev.connectionAttempts + 1,
      }));

      // Show error notification with retry action
      handleNetworkError(error);
    }
  }, [error, handleNetworkError]);

  // Update connecting state
  useEffect(() => {
    setStatus(prev => ({
      ...prev,
      isConnecting: isLoading && !prev.isConnected,
    }));
  }, [isLoading]);

  // Manual reconnection function
  const reconnect = useCallback(async () => {
    setStatus(prev => ({
      ...prev,
      isConnecting: true,
      connectionAttempts: prev.connectionAttempts + 1,
    }));

    try {
      // Force reconnection by disconnecting first
      await freelanceForgeAPI.disconnect();
      
      // Trigger refetch to establish new connection
      await refetch();
    } catch (error) {
      console.error('Manual reconnection failed:', error);
      handleNetworkError(error);
    }
  }, [refetch, handleNetworkError]);

  // Check if we should show connection warnings
  const shouldShowWarning = status.connectionAttempts > 2 && !status.isConnected;

  return {
    ...status,
    reconnect,
    shouldShowWarning,
    isLoading,
  };
}

// Hook for monitoring RPC endpoint health
export function useRpcEndpointHealth() {
  const [endpointHealth, setEndpointHealth] = useState<Record<string, {
    isHealthy: boolean;
    responseTime: number;
    lastChecked: Date;
    errorCount: number;
  }>>({});

  const checkEndpointHealth = useCallback(async (endpoint: string) => {
    const startTime = Date.now();
    
    try {
      // Simple health check - try to connect and get basic info
      const response = await fetch(endpoint.replace('ws', 'http'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'system_health',
          params: [],
        }),
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;

      setEndpointHealth(prev => ({
        ...prev,
        [endpoint]: {
          isHealthy,
          responseTime,
          lastChecked: new Date(),
          errorCount: isHealthy ? 0 : (prev[endpoint]?.errorCount || 0) + 1,
        },
      }));

      return { isHealthy, responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      setEndpointHealth(prev => ({
        ...prev,
        [endpoint]: {
          isHealthy: false,
          responseTime,
          lastChecked: new Date(),
          errorCount: (prev[endpoint]?.errorCount || 0) + 1,
        },
      }));

      return { isHealthy: false, responseTime };
    }
  }, []);

  return {
    endpointHealth,
    checkEndpointHealth,
  };
}

// Hook for automatic endpoint switching on failures
export function useEndpointFailover() {
  const { reconnect } = useNetworkStatus();
  const [failoverAttempts, setFailoverAttempts] = useState(0);
  const [lastFailover, setLastFailover] = useState<Date | null>(null);

  const triggerFailover = useCallback(async () => {
    // Prevent too frequent failover attempts
    if (lastFailover && Date.now() - lastFailover.getTime() < 30000) {
      console.log('Failover rate limited, skipping...');
      return;
    }

    setFailoverAttempts(prev => prev + 1);
    setLastFailover(new Date());

    console.log(`Triggering endpoint failover (attempt ${failoverAttempts + 1})`);
    
    try {
      await reconnect();
    } catch (error) {
      console.error('Failover failed:', error);
    }
  }, [reconnect, failoverAttempts, lastFailover]);

  // Reset failover attempts on successful connection
  const resetFailover = useCallback(() => {
    setFailoverAttempts(0);
    setLastFailover(null);
  }, []);

  return {
    triggerFailover,
    resetFailover,
    failoverAttempts,
    canFailover: !lastFailover || Date.now() - lastFailover.getTime() > 30000,
  };
}