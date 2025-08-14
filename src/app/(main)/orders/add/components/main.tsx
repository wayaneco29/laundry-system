"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building,
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
import * as Yup from "yup";
import { Button, Input, Select } from "@/app/components/common";
import { PaymentModal } from "../../components/payment-modal";
import { addOrder, getAllBranches, getAllCustomers } from "@/app/actions";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import moment from "moment";
import { useUserContext } from "@/app/context";
import { twMerge } from "tailwind-merge";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useToast } from "@/app/hooks";

type MainAddPageProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<any>;
  branches: Array<any>;
};

const schema = Yup.object().shape({
  customerId: Yup.string().required(),
  branchId: Yup.string().required(),
  services: Yup.array().min(1).required(),
});

export const MainAddPage = ({ data, branches = [] }: MainAddPageProps) => {
  const router = useRouter();
  const { is_admin, branch_id } = useUserContext();
  const { userId } = useCurrentUser();
  const toast = useToast();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchServices, setSearchServices] = useState("");
  const [customers, setCustomers] = useState<Array<any>>([]);
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(true);

  const { control, handleSubmit, setValue, watch, reset, formState } = useForm({
    defaultValues: {
      customerId: "",
      branchId: branch_id || "",
      services: [],
    },
    mode: "onChange",
    resolver: yupResolver(schema),
  });

  const services = watch("services", []);

  const grossTotal = services?.reduce(
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

  const onSubmit = handleSubmit(async (payload) => {
    try {
      const { data, error } = await addOrder({
        p_branch_id: payload?.branchId || branch_id,
        p_customer_id: payload?.customerId, // Use selected customer ID
        p_staff_id: userId!, // Use authenticated user ID
        p_items: payload?.services,
        p_order_date: moment().toISOString(),
        p_order_status: "Pending",
        p_payment_status: "Unpaid",
        p_total_price: grossTotal,
      });

      if (error) throw error;

      toast.success("Create order successfully");
      // Clear selected services and customer after successful order

      // Add a small delay for better UX (optional)
      setTimeout(() => {
        // Redirect to orders page
        router.push("/orders");
      }, 500);
    } catch (_error) {
      toast.error("Failed to create order.");
    }
  });

  const updateQuantity = async (index: number, newQuantity: number) => {
    const watchServices = await watch("services", []);

    if (newQuantity < 1) return;

    const clonedServices = [...watchServices];
    clonedServices[index] = {
      ...clonedServices[index],
      quantity: newQuantity,
      total: clonedServices[index].price * newQuantity,
    };

    setValue("services", clonedServices);
  };

  const removeService = async (index: number) => {
    const watchServices = await watch("services", []);
    const filteredServices = watchServices.filter((_, i) => i !== index);

    setValue("services", filteredServices);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleService = async (service: any) => {
    const watchServices = await watch("services", []);
    const existingServices = watchServices.find((x) => x.id === service.id);

    if (existingServices) {
      const filteredServices = watchServices.filter((x) => x.id !== service.id);
      setValue("services", filteredServices);
    } else {
      setValue("services", [
        ...watchServices,
        { ...service, quantity: 1, total: service.price },
      ]);
    }
  };

  const branchOptions = [
    ...branches.map((branch: any) => ({
      label: branch.name,
      value: branch.id,
    })),
  ];

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
              {services?.length} service
              {services?.length !== 1 ? "s" : ""} selected
            </div>
          </div>
        </div>
      </div>

      <div className={"px-4 sm:px-6 lg:px-8 py-8"}>
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
                  <Input
                    placeholder="Search services..."
                    value={searchServices}
                    onChange={(event) => setSearchServices(event.target.value)}
                    className="pl-10 w-full bg-white rounded-md"
                    disabled={formState?.isSubmitting}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Loading Overlay for Services Grid */}
              <div className="relative">
                {formState?.isSubmitting && (
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
                      const isSelected = services.some(
                        (x) => x.id === service.id
                      );

                      return (
                        <div
                          key={service.id}
                          onClick={() =>
                            !formState?.isSubmitting && toggleService(service)
                          }
                          className={`
                            relative p-4 rounded-lg cursor-pointer transition-all duration-200
                            ${
                              formState?.isSubmitting
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
            <form onSubmit={onSubmit}>
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
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="p-6 pb-0 bg-gray-50">
                      <div className="flex items-center space-x-2 mb-3">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Customer
                        </span>
                      </div>
                      <Select
                        placeholder={
                          loadingCustomers
                            ? "Loading customers..."
                            : "Select customer..."
                        }
                        options={customerOptions}
                        isDisabled={formState?.isSubmitting || loadingCustomers}
                        isLoading={loadingCustomers}
                        containerClassName="w-full"
                        noOptionsMessage={() => "No customers found"}
                        {...field}
                        onChange={(data: any) => {
                          field?.onChange(data?.value);
                        }}
                      />
                      {!!error && (
                        <p className="text-xs text-red-500 mt-1">
                          Please select a customer to continue
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="branchId"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return is_admin ? (
                      <div className="p-6 bg-gray-50">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="w-full">
                            <div className="flex items-center space-x-2 mb-3">
                              <Building className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Branch
                              </span>
                            </div>
                            <Select
                              disabled={formState?.isSubmitting}
                              options={branchOptions}
                              placeholder="Select branch..."
                              {...field}
                              onChange={(data: any) => {
                                field?.onChange(data?.value);
                              }}
                            />
                            {!!error && (
                              <p className="text-xs text-red-500 mt-1">
                                Please select a branch to continue
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <></>
                    );
                  }}
                />
                {/* Selected Services */}
                <div className="p-6 pt-0">
                  {services.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        No services selected
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {services.map((service, index) => (
                        <div
                          key={index}
                          className={`bg-gray-50 rounded-lg p-4 ${
                            formState?.isSubmitting ? "opacity-50" : ""
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
                              type="button"
                              onClick={() =>
                                !formState?.isSubmitting && removeService(index)
                              }
                              disabled={formState?.isSubmitting}
                              className="cursor-pointer ml-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() =>
                                  !formState?.isSubmitting &&
                                  updateQuantity(
                                    index,
                                    (service.quantity || 1) - 1
                                  )
                                }
                                disabled={
                                  formState?.isSubmitting ||
                                  service.quantity === 1
                                }
                                className="p-1 text-gray-600 cursor-pointer hover:bg-gray-200 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-gray-700">
                                {service.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  !formState?.isSubmitting &&
                                  updateQuantity(
                                    index,
                                    (service.quantity || 1) + 1
                                  )
                                }
                                disabled={formState?.isSubmitting}
                                className="p-1 text-gray-600 cursor-pointer hover:bg-gray-200 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
                {services.length > 0 && (
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
                          setValue("services", []);
                          setValue("customerId", "");

                          if (is_admin) {
                            setValue("branchId", "");
                          }
                        }}
                        disabled={formState?.isSubmitting}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white flex flex-row items-center justify-center space-x-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear All</span>
                      </Button>
                      <Button
                        type="submit"
                        // disabled={isConfirm}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {formState?.isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Confirming...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Confirm</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </form>
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
