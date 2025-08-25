'use client';

import { Service } from '@/lib/services';
import { HealthStatus } from '@/lib/health';
import { ExternalLink, Clock, Tag, Users, GitBranch, BookOpen } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  healthStatus?: HealthStatus;
  onLaunch: (service: Service) => void;
}

export default function ServiceCard({ service, healthStatus, onLaunch }: ServiceCardProps) {
  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'beta': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'development': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'deprecated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthIndicator = () => {
    if (!healthStatus) return null;
    
    const colors = {
      healthy: 'bg-green-500',
      unhealthy: 'bg-red-500',
      unknown: 'bg-gray-500'
    };

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className={`w-2 h-2 rounded-full ${colors[healthStatus.status]}`} />
        <span className="capitalize">{healthStatus.status}</span>
        {healthStatus.responseTime && (
          <span className="text-xs">({healthStatus.responseTime}ms)</span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{service.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(service.status)}`}>
                {service.status}
              </span>
              <span className="text-xs text-gray-500">v{service.version}</span>
            </div>
          </div>
        </div>
        {getHealthIndicator()}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>

      {/* Category & Tags */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{service.category}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {service.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
          {service.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              +{service.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          {service.features.slice(0, 3).map(feature => (
            <li key={feature} className="flex items-center gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>Updated {service.lastUpdated}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={12} />
          <span>{service.author}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onLaunch(service)}
          className="flex-1 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          Launch <ExternalLink size={14} />
        </button>
        
        <div className="flex gap-1">
          {service.documentation && (
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <BookOpen size={16} />
            </button>
          )}
          {service.github && (
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <GitBranch size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}