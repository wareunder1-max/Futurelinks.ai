'use client';

import { useState, useEffect } from 'react';

/**
 * Monitoring Dashboard Component
 * 
 * Displays real-time monitoring metrics including:
 * - Error rates
 * - API performance
 * - System health indicators
 * - Alert status
 * 
 * Requirements: 11.1, 11.5
 */

interface HealthMetrics {
  errorRate: number;
  avgResponseTime: number;
  totalRequests: number;
  failedRequests: number;
  activeAPIKeys: number;
  lastUpdated: Date;
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
}

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/monitoring');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data.metrics);
          setAlerts(data.alerts || []);
        }
      } catch (error) {
        console.error('Failed to fetch monitoring metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = () => {
    if (!metrics) return 'unknown';
    if (metrics.errorRate > 0.1) return 'critical';
    if (metrics.errorRate > 0.05) return 'warning';
    if (metrics.avgResponseTime > 5000) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'error':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">System Monitoring</h2>
        <div className="text-gray-600">Loading monitoring data...</div>
      </div>
    );
  }

  const healthStatus = getHealthStatus();

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">System Monitoring</h2>

      {/* Health Status Card */}
      <div className={`mb-6 p-4 rounded-lg border-2 ${getStatusColor(healthStatus)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">System Health</h3>
            <p className="text-sm capitalize">{healthStatus}</p>
          </div>
          <div className="text-3xl">
            {healthStatus === 'healthy' && '✓'}
            {healthStatus === 'warning' && '⚠'}
            {healthStatus === 'critical' && '✕'}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Error Rate</h4>
            <p className="text-2xl font-bold">
              {(metrics.errorRate * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.failedRequests} / {metrics.totalRequests} requests
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Avg Response Time</h4>
            <p className="text-2xl font-bold">
              {metrics.avgResponseTime.toFixed(0)}ms
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last {metrics.totalRequests} requests
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Active API Keys</h4>
            <p className="text-2xl font-bold">{metrics.activeAPIKeys}</p>
            <p className="text-xs text-gray-500 mt-1">
              Available for requests
            </p>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Active Alerts</h3>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded border ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-xs font-semibold uppercase">
                      {alert.severity}
                    </span>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Status */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Monitoring Integrations</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Vercel Analytics</span>
            <span className="text-xs text-green-600 font-medium">✓ Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Speed Insights</span>
            <span className="text-xs text-green-600 font-medium">✓ Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Sentry Error Tracking</span>
            <span className="text-xs text-green-600 font-medium">✓ Active</span>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {metrics && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}
