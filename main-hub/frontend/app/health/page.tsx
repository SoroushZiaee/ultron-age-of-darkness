'use client';

import { useState, useEffect } from 'react';
import { services } from '@/lib/services';
import { HealthChecker, HealthStatus } from '@/lib/health';
import { Activity, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function HealthPage() {
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const healthChecker = HealthChecker.getInstance();

  const refreshHealthStatuses = async () => {
    setIsRefreshing(true);
    
    // Check health for all services with health endpoints
    const servicesWithHealth = services.filter(s => s.healthEndpoint);
    const promises = servicesWithHealth.map(service => 
      service.healthEndpoint ? healthChecker.checkServiceHealth(service.id, service.healthEndpoint) : null
    );
    
    await Promise.all(promises);
    setHealthStatuses(healthChecker.getAllHealthStatuses());
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshHealthStatuses();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshHealthStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'unhealthy':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <AlertTriangle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'unhealthy':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const healthyCount = healthStatuses.filter(s => s.status === 'healthy').length;
  const unhealthyCount = healthStatuses.filter(s => s.status === 'unhealthy').length;
  const unknownCount = healthStatuses.filter(s => s.status === 'unknown').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Health</h1>
          <p className="text-lg text-gray-600">
            Monitor the health and status of all services in real-time.
          </p>
        </div>
        
        <button
          onClick={refreshHealthStatuses}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-gray-900">{healthStatuses.length}</div>
              <div className="text-sm font-medium text-gray-700">Total Services</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-green-900">{healthyCount}</div>
              <div className="text-sm font-medium text-gray-700">Healthy</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-red-900">{unhealthyCount}</div>
              <div className="text-sm font-medium text-gray-700">Unhealthy</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-gray-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-gray-900">{unknownCount}</div>
              <div className="text-sm font-medium text-gray-700">Unknown</div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Clock size={14} />
        <span>Last updated: {lastUpdated.toLocaleString()}</span>
      </div>

      {/* Health Status List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Service Status Details</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {healthStatuses.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-gray-400 mb-2">
                <Activity size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No health data available</h3>
              <p className="text-gray-600">Services with health endpoints will appear here.</p>
            </div>
          ) : (
            healthStatuses.map((status) => {
              const service = services.find(s => s.id === status.serviceId);
              return (
                <div key={status.serviceId} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>{getStatusIcon(status.status)}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {service ? service.name : status.serviceId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {service ? service.description : 'Service description not available'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {status.responseTime && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{status.responseTime}ms</span>
                        </div>
                      )}
                      
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(status.status)}`}>
                        {status.status}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {new Date(status.lastChecked).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {status.error && (
                    <div className="mt-2 ml-8">
                      <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
                        <strong>Error:</strong> {status.error}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}