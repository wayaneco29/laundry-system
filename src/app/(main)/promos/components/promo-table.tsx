import moment from "moment";
import {
  Tag,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Edit2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination } from "@/app/components/common/pagination";
import { getAllPromos } from "@/app/actions";

type PromoTableProps = {
  initialData: Array<Record<string, string>>;
  count: number;
  onEdit: (promo: Record<string, string>) => void;
  search?: string;
  status?: string;
};

export const PromoTable = ({
  initialData,
  count,
  onEdit,
  search,
  status,
}: PromoTableProps) => {
  const [data, setData] = useState<Array<Record<string, string>>>(
    initialData || []
  );
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(count || 0);

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const fetchData = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const result = await getAllPromos({
        page,
        limit,
        search,
        status,
      });
      setData(result.data || []);
      setTotalItems(result.count || 0);
    } catch (error) {
      console.error("Error fetching promos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, search, status, initialData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "Expired":
        return "text-red-600 bg-red-100";
      case "Closed":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4" />;
      case "Expired":
        return <XCircle className="h-4 w-4" />;
      case "Closed":
        return <Clock className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Promo Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valid Until
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
            {loading ? (
              <tr className="relative">
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Tag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No promos
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first promo.
                  </p>
                </td>
              </tr>
            ) : (
              data?.map((promo, index) => (
                <tr key={promo.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {promo.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {promo.code}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {promo.description || "No description"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {moment(promo.valid_until).format("MMM DD, YYYY")}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        promo.status
                      )}`}
                    >
                      {getStatusIcon(promo.status)}
                      {promo.status}
                    </span>
                  </td>
                  <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium shadow-sm">
                    <button
                      onClick={() => onEdit(promo)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-x-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
};
