import { Suspense } from 'react';
import StaffReportMain from './components/staff-report-main';

export default function StaffReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Staff Commission Reports</h1>
        <p className="text-gray-600 mt-1">
          Track staff performance, sales, and commission calculations
        </p>
      </div>

      {/* Main Content */}
      <Suspense
        fallback={
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <StaffReportMain />
      </Suspense>
    </div>
  );
}