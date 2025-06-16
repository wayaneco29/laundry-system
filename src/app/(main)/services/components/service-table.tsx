"use client";

import {
  Package,
  DollarSign,
  Edit2,
  CheckCircle,
  XCircle,
} from "lucide-react";

type ServiceTableProps = {
  data: Array<Record<string, string>>;
  onEdit: (service: Record<string, string>) => void;
};

export const ServiceTable = ({ data, onEdit }: ServiceTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "Inactive":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No services</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first service.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="sticky right-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((service, index) => (
              <tr key={service.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-3" />
                    <div className="text-sm font-medium text-gray-900">
                      {service.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-900">
                      ₱{service.price}/KG
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status === "Active" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {service.status}
                  </span>
                </td>
                <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium shadow-sm">
                  <button
                    onClick={() => onEdit(service)}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-x-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
