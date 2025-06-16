"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Check,
  Trash2,
  User,
  Package,
  Loader2,
} from "lucide-react";

import { Button, Input, Select } from "@/app/components/common";
import { PaymentModal } from "../../components/payment-modal";
import { addOrder, getAllCustomers } from "@/app/actions";
import moment from "moment";

type MainAddPageProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<any>;
};

export const MainAddPage = ({ data }: MainAddPageProps) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchServices, setSearchServices] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedServices, setSelectedServices] = useState<Array<any>>([]);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customers, setCustomers] = useState<Array<any>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(true);

  const grossTotal = selectedServices?.reduce(
    (acc, service) => acc + (service?.price * (service?.quantity || 0) || 0),
    0
  );

  const servicesList = useMemo(() => {
    return data?.filter((xData) =>
      xData?.name?.toLowerCase().includes(searchServices?.toLowerCase())
    );
  }, [data, searchServices]);

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const { data: customersData, error } = await getAllCustomers();

        if (error) {
          console.error("Error fetching customers:", error);
          return;
        }

        setCustomers(customersData || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Format customers for Select component
  const customerOptions = useMemo(() => {
    return customers.map((customer) => ({
      value: customer.customer_id,
      label: `${customer.first_name} ${customer.last_name}`,
    }));
  }, [customers]);

  const handleConfirmOrder = async () => {
    // Validate customer selection
    if (!selectedCustomer) {
      alert("Please select a customer before confirming the order.");
      return;
    }

    // Validate services selection
    if (selectedServices.length === 0) {
      alert("Please select at least one service before confirming the order.");
      return;
    }

    setIsConfirming(true);

    try {
      const { error } = await addOrder({
        p_branch_id: "f618210d-01ef-4bd5-8602-d6ff66e12ec7",
        p_customer_id: selectedCustomer, // Use selected customer ID
        p_staff_id: "acc38e50-d753-4cb5-a09c-7a179a56fc39",
        p_items: selectedServices,
        p_order_date: moment().toISOString(),
        p_order_status: "Pending",
        p_payment_status: "Unpaid",
        p_total_price: grossTotal,
      });

      if (error) throw error;

      // Clear selected services and customer after successful order
      setSelectedServices([]);
      setSelectedCustomer("");

      // Add a small delay for better UX (optional)
      setTimeout(() => {
        // Redirect to orders page
        router.push("/orders");
      }, 500);
    } catch (_error) {
      console.error(_error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 0) return;

    const clonedServices = [...selectedServices];
    clonedServices[index] = {
      ...clonedServices[index],
      quantity: newQuantity,
      total: clonedServices[index].price * newQuantity,
    };
    setSelectedServices(clonedServices);
  };

  const removeService = (index: number) => {
    setSelectedServices((prev) => prev.filter((_, i) => i !== index));
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleService = (service: any) => {
    const existing = selectedServices.find((x) => x.id === service.id);

    if (existing) {
      setSelectedServices((prev) => prev.filter((x) => x.id !== service.id));
    } else {
      setSelectedServices((prev) => [
        ...prev,
        { ...service, quantity: 1, total: service.price },
      ]);
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCustomerChange = (selectedOption: any) => {
    setSelectedCustomer(selectedOption?.value || "");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Add Order
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage new orders efficiently
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-sm text-gray-500">
              {selectedServices.length} service
              {selectedServices.length !== 1 ? "s" : ""} selected
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Services Selection - Left Panel */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Header with blue background */}
              <div className="bg-blue-500 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">
                    AVAILABLE SERVICES
                  </h2>
                </div>
              </div>

              {/* Search Section */}
              <div className="p-6 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search services..."
                    value={searchServices}
                    onChange={(event) => setSearchServices(event.target.value)}
                    className="pl-10 w-full bg-white"
                    disabled={isConfirming}
                  />
                </div>
              </div>

              {/* Loading Overlay for Services Grid */}
              <div className="relative">
                {isConfirming && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      <p className="text-sm text-gray-600 font-medium">
                        Processing order...
                      </p>
                    </div>
                  </div>
                )}

                {/* Services Grid */}
                <div className="p-6 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {servicesList?.map((service) => {
                      const isSelected = selectedServices.some(
                        (x) => x.id === service.id
                      );

                      return (
                        <div
                          key={service.id}
                          onClick={() =>
                            !isConfirming && toggleService(service)
                          }
                          className={`
                            relative p-4 rounded-lg cursor-pointer transition-all duration-200
                            ${
                              isConfirming
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                            }
                            ${
                              isSelected
                                ? "bg-green-100 shadow-md"
                                : "bg-white shadow-sm hover:shadow-md"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">
                                {service.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                ₱{service.price}/kg
                              </p>
                            </div>

                            {isSelected && (
                              <div className="ml-2 p-1 bg-green-500 rounded-full">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {servicesList?.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No services found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary - Right Panel */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-8">
              {/* Header with blue background */}
              <div className="bg-blue-500 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">
                    ORDER SUMMARY
                  </h2>
                </div>
              </div>

              {/* Customer Selection */}
              <div className="p-6 bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    CUSTOMER
                  </span>
                </div>
                <Select
                  placeholder={
                    loadingCustomers
                      ? "Loading customers..."
                      : "Select customer..."
                  }
                  options={customerOptions}
                  value={selectedCustomer}
                  onChange={handleCustomerChange}
                  isDisabled={isConfirming || loadingCustomers}
                  isLoading={loadingCustomers}
                  containerClassName="w-full"
                  noOptionsMessage={() => "No customers found"}
                />
                {!selectedCustomer && (
                  <p className="text-xs text-red-500 mt-1">
                    Please select a customer to continue
                  </p>
                )}
              </div>

              {/* Selected Services */}
              <div className="p-6 pt-0">
                {selectedServices.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      No services selected
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {selectedServices.map((service, index) => (
                      <div
                        key={index}
                        className={`bg-gray-50 rounded-lg p-4 ${
                          isConfirming ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {service.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              ₱{service.price}/kg
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              !isConfirming && removeService(index)
                            }
                            disabled={isConfirming}
                            className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                !isConfirming &&
                                updateQuantity(
                                  index,
                                  (service.quantity || 1) - 1
                                )
                              }
                              disabled={isConfirming}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {service.quantity || 1}
                            </span>
                            <button
                              onClick={() =>
                                !isConfirming &&
                                updateQuantity(
                                  index,
                                  (service.quantity || 1) + 1
                                )
                              }
                              disabled={isConfirming}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            ₱{service.total || service.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total and Actions */}
              {selectedServices.length > 0 && (
                <div className="p-6 pt-0">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        TOTAL
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        ₱{grossTotal}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => {
                        setSelectedServices([]);
                        setSelectedCustomer("");
                      }}
                      disabled={isConfirming}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center space-x-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear All</span>
                    </Button>
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={
                        isConfirming ||
                        !selectedCustomer ||
                        selectedServices.length === 0
                      }
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center space-x-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConfirming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Confirming...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Confirm Order</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        show={showModal}
        grossTotal={grossTotal}
        onClose={() => setShowModal(false)}
        onSubmit={() => setShowModal(false)}
      />
    </div>
  );
};
