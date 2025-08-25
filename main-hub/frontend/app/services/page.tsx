'use client';

import { services } from '@/lib/services';
import ServiceGrid from '@/components/ServiceGrid';

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Services</h1>
        <p className="text-lg text-gray-600">
          Browse and manage all available services in the Intelligent Hub platform.
        </p>
      </div>

      <ServiceGrid initialServices={services} />
    </div>
  );
}