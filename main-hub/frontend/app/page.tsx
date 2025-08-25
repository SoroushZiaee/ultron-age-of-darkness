'use client';

import { services, categories } from '@/lib/services';
import ServiceGrid from '@/components/ServiceGrid';
import { Activity, Zap, Shield, TrendingUp } from 'lucide-react';

export default function Home() {
  const stats = [
    {
      name: 'Active Services',
      value: services.filter(s => s.status === 'active').length,
      icon: Activity,
      description: 'Currently running'
    },
    {
      name: 'Total Services',
      value: services.length,
      icon: Zap,
      description: 'In platform'
    },
    {
      name: 'Categories',
      value: Object.keys(categories).length,
      icon: Shield,
      description: 'Service types'
    },
    {
      name: 'Uptime',
      value: '99.9%',
      icon: TrendingUp,
      description: 'Platform reliability'
    }
  ];

  const featuredServices = services.filter(service => service.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Intelligent Hub
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Your centralized platform for managing and accessing intelligent services. 
          Discover AI-powered tools, utilities, and analytics services all in one place.
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-medium text-gray-700">{stat.name}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Service Categories Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categories).map(([key, category]) => {
            const categoryServices = services.filter(service => service.category === key);
            return (
              <div key={key} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{category.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{categoryServices.length} services</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-1">
                  {categoryServices.slice(0, 3).map(service => (
                    <span key={service.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {service.name.split(' ')[0]}
                    </span>
                  ))}
                  {categoryServices.length > 3 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      +{categoryServices.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Services Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Services</h2>
          <div className="text-sm text-gray-600">
            {featuredServices.length} active service{featuredServices.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <ServiceGrid initialServices={featuredServices} />
      </div>

      {/* Getting Started */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Getting Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h4 className="font-medium text-blue-900">Browse Services</h4>
              <p className="text-sm text-blue-700">Explore available services by category or search for specific tools.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h4 className="font-medium text-blue-900">Launch & Use</h4>
              <p className="text-sm text-blue-700">Click launch to open any service in a new tab and start using it immediately.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h4 className="font-medium text-blue-900">Monitor Health</h4>
              <p className="text-sm text-blue-700">Check service status and health indicators for optimal performance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}