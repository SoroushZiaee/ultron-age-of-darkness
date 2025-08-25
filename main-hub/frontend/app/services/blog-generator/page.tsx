'use client';

import { useEffect } from 'react';
import { getServiceById } from '@/lib/services';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BlogGeneratorPage() {
  const service = getServiceById('blog-generator');

  useEffect(() => {
    if (service) {
      // Redirect to the service URL
      window.location.href = service.url;
    }
  }, [service]);

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">The requested service could not be found.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/services" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft size={16} />
          Back to Services
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
        <p className="text-lg text-gray-600">{service.description}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🚀</div>
          <h2 className="text-lg font-semibold text-blue-900">Redirecting to Service...</h2>
        </div>
        <p className="text-blue-800 mb-4">
          You are being redirected to the Blog Generator service. If the redirect doesn't work, 
          click the link below to access the service directly.
        </p>
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Open {service.name} <ExternalLink size={16} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
          <ul className="space-y-2">
            {service.features.map(feature => (
              <li key={feature} className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-600">Version</dt>
              <dd className="text-sm text-gray-900">{service.version}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Category</dt>
              <dd className="text-sm text-gray-900">{service.category}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Status</dt>
              <dd className="text-sm text-gray-900 capitalize">{service.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Last Updated</dt>
              <dd className="text-sm text-gray-900">{service.lastUpdated}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}