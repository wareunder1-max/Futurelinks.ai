'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Usage Dashboard Component
 * 
 * Client component that displays usage metrics with:
 * - Sortable table columns
 * - Date range filtering
 * - Real-time polling updates (5 seconds)
 * 
 * Requirements: 11.2, 11.3, 11.4, 11.5
 */

interface UsageMetric {
  apiKeyId: string;
  provider: string;
  totalRequests: number;
  lastRequestAt: Date | null;
}

type SortField = 'provider' | 'totalRequests' | 'lastRequestAt';
type SortDirection = 'asc' | 'desc';

export function UsageDashboard() {
  const [metrics, setMetrics] = useState<UsageMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('totalRequests');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Date filtering state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch usage metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/usage?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch usage metrics');
      }

      const data = await response.json();
      setMetrics(data.metrics || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Polling for real-time updates (5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort metrics
  const sortedMetrics = [...metrics].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle null values for lastRequestAt
    if (sortField === 'lastRequestAt') {
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortDirection === 'asc' ? -1 : 1;
      if (!bValue) return sortDirection === 'asc' ? 1 : -1;
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle string comparison for provider
    if (sortField === 'provider') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  // Render sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (loading && metrics.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Usage Dashboard</h1>
        <div className="text-gray-600">Loading usage metrics...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Usage Dashboard</h1>

      {/* Date Range Filters */}
      <div className="mb-6 flex gap-4 items-end">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          onClick={() => {
            setStartDate('');
            setEndDate('');
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Clear Filters
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Usage Metrics Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('provider')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Provider
                <SortIndicator field="provider" />
              </th>
              <th
                onClick={() => handleSort('totalRequests')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Total Requests
                <SortIndicator field="totalRequests" />
              </th>
              <th
                onClick={() => handleSort('lastRequestAt')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Last Used
                <SortIndicator field="lastRequestAt" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedMetrics.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No usage data available
                </td>
              </tr>
            ) : (
              sortedMetrics.map((metric) => (
                <tr key={metric.apiKeyId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {metric.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.totalRequests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(metric.lastRequestAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        Auto-refreshing every 5 seconds
      </div>
    </div>
  );
}
