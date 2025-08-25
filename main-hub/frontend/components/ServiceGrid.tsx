'use client';

import { useState, useEffect } from 'react';
import { Service, ServiceCategory, categories, services } from '@/lib/services';
import { HealthChecker, HealthStatus } from '@/lib/health';
import ServiceCard from './ServiceCard';
import { Search, Filter, Grid, List } from 'lucide-react';

interface ServiceGridProps {
  initialServices?: Service[];
}

export default function ServiceGrid({ initialServices = services }: ServiceGridProps) {
  const [filteredServices, setFilteredServices] = useState<Service[]>(initialServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [healthStatuses, setHealthStatuses] = useState<Map<string, HealthStatus>>(new Map());

  const healthChecker = HealthChecker.getInstance();

  useEffect(() => {
    // Start health checks for services with health endpoints
    const servicesWithHealth = initialServices.filter(s => s.healthEndpoint);
    healthChecker.startPeriodicHealthChecks(servicesWithHealth);

    // Update health statuses every 5 seconds
    const interval = setInterval(() => {
      const statuses = new Map<string, HealthStatus>();
      healthChecker.getAllHealthStatuses().forEach(status => {
        statuses.set(status.serviceId, status);
      });
      setHealthStatuses(statuses);
    }, 5000);

    return () => clearInterval(interval);
  }, [initialServices, healthChecker]);

  useEffect(() => {
    let filtered = initialServices;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, initialServices]);

  const handleLaunch = (service: Service) => {
    window.open(service.url, '_blank', 'noopener,noreferrer');
  };

  const categoryEntries = Object.entries(categories) as [ServiceCategory, typeof categories[ServiceCategory]][];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters and View Toggle */}
        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ServiceCategory | 'all')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categoryEntries.map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} 
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== 'all' && ` in ${categories[selectedCategory].name}`}
        </span>
      </div>

      {/* Services Grid/List */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              healthStatus={healthStatuses.get(service.id)}
              onLaunch={handleLaunch}
            />
          ))}
        </div>
      )}
    </div>
  );
}