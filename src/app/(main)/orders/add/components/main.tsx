"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, Input } from "@/app/components/common";
import { PaymentModal } from "../../components/payment-modal";
import { CheckIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { addOrder } from "@/app/actions";
import moment from "moment";

type MainAddPageProps = {
  data: Array<any>;
};

export const MainAddPage = ({ data }: MainAddPageProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchServices, setSearchServices] = useState("");
  const [selectedServices, setSelectedServices] = useState<Array<any>>([]);

  const grossTotal = selectedServices?.reduce(
    (acc, service) => acc + (service?.price * (service?.quantity || 0) || 0),
    0
  );

  const servicesList = useMemo(() => {
    return data?.filter((xData) =>
      xData?.name?.toLowerCase().includes(searchServices?.toLowerCase())
    );
  }, [data, searchServices]);

  const handleConfirmOrder = async () => {
    try {
      const { data, error } = await addOrder({
        p_branch_id: "23ad1191-ca30-4138-9887-00566975876c",
        p_customer_id: "0d0a7abf-67ce-487f-80c5-36f5c64ebae6",
        p_staff_id: "ed541d2d-bc64-4a03-b4b9-e122310c661c",
        p_items: selectedServices,
        p_order_date: moment().toISOString(),
        p_order_status: "Pending",
        p_payment_status: "Unpaid",
        p_total_price: grossTotal,
      });

      if (error) throw error;

      console.log(data);
    } catch (_error) {
      console.error(_error);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-4 p-4 lg:p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-gray-700 text-2xl font-medium">Add Order</h1>
        </div>
        {/* <div className="mt-4">
          <div className="relative overflow-auto bg-white text-gray-600 rounded-sm text-gray-600lg:p-8">
            <div className="p-4">
              <div className="flex items-baseline-last gap-8">
                <Input
                  label="Select Customer"
                  placeholder="Select Customer"
                  containerClassName="w-full max-w-lg"
                />
                <Button className="w-fit" onClick={() => setShowModal(true)}>
                  Add Services
                </Button>
              </div>
            </div>
          </div>
        </div> */}
        <div className="mt-4">
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <div className="bg-white text-gray-600 p-8 rounded-md  h-[calc(100vh-265px)] shadow-md">
                  <div className="font-medium mb-4">
                    <Input
                      placeholder="Search services"
                      value={searchServices}
                      onChange={(event) =>
                        setSearchServices(event.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {servicesList?.map((service) => {
                      const existing = selectedServices?.some(
                        (x) => x?.id === service?.id
                      );

                      return (
                        <div
                          className={`flex-1 bg-gray-100 rounded-md h-[100px] border border-dashed ${
                            existing && "!bg-green-100"
                          }`}
                          onClick={() => {
                            if (existing) {
                              setSelectedServices((prev) =>
                                prev?.filter(
                                  (xPrev) => xPrev?.id !== service?.id
                                )
                              );
                            } else {
                              setSelectedServices((prev) => [...prev, service]);
                            }
                          }}
                        >
                          <div className="flex items-center justify-center h-full cursor-pointer">
                            <span className="font-medium relative">
                              {existing && (
                                <CheckIcon className="absolute size-5 mr-2 -left-6" />
                              )}
                              {service?.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="col-span-1 bg-white text-gray-600 rounded-md shadow-md">
                <div className="flex flex-col h-full">
                  <div className="p-4">
                    <Input
                      placeholder="Select Customer"
                      containerClassName="w-full max-w-lg"
                    />
                  </div>
                  <div className="text-black flex-1">
                    <div className="relative overflow-auto rounded-sm">
                      <table className="table w-full">
                        <thead className="group/head text-xs uppercase text-gray-700">
                          <tr>
                            <th className="text-start bg-blue-400 px-6 py-4 bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                              Service
                            </th>
                            <th className="bg-blue-400 px-6 py-4 bg-primary-500 text-white sticky top-0 z-10 text-nowrap w-60">
                              Price / KG
                            </th>
                            <th className="bg-blue-400 px-6 py-4 bg-primary-500 text-white sticky top-0 z-10 text-nowrap w-40">
                              Quantity
                            </th>
                            <th className="bg-blue-400 px-6 py-4 bg-primary-500 text-white sticky top-0 z-10 text-nowrap w-40">
                              Total
                            </th>
                            <th className="bg-blue-400 px-6 py-4 bg-primary-500 text-white sticky top-0 z-10 text-nowrap w-10">
                              <div className="sr-only">Actions</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="relative">
                          {selectedServices?.length ? (
                            selectedServices?.map((service, index) => (
                              <tr key={index}>
                                <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                                  {service?.name}
                                </td>
                                <td className="text-center text-nowrap px-6 py-3 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                                  ₱ {service?.price}
                                </td>
                                <td className="text-center text-nowrap px-6 py-3 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                                  <Input
                                    containerClassName="w-20 mx-auto"
                                    className="text-center"
                                    value={service?.quantity}
                                    onChange={(event) => {
                                      const newValue =
                                        event?.target?.value?.replace(
                                          /\D/g,
                                          ""
                                        );

                                      const clonedSelectedServices = JSON.parse(
                                        JSON.stringify(selectedServices)
                                      );

                                      clonedSelectedServices[index].quantity =
                                        newValue;
                                      clonedSelectedServices[index].total =
                                        service?.price * Number(newValue);

                                      setSelectedServices(
                                        clonedSelectedServices
                                      );
                                    }}
                                  />
                                </td>
                                <td className="text-center text-nowrap px-6 py-3 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                                  <strong>₱ {service?.total || 0}</strong>
                                </td>
                                <td className="text-center text-nowrap px-6 py-3 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                                  <XMarkIcon
                                    className="text-red-500 size-5 cursor-pointer"
                                    onClick={() => {
                                      const clonedSelectedServices = JSON.parse(
                                        JSON.stringify(selectedServices)
                                      );

                                      setSelectedServices(
                                        clonedSelectedServices?.filter(
                                          (_: unknown, i: number) => i !== index
                                        )
                                      );
                                    }}
                                  />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <div className="table-row relative h-22">
                              <div className="absolute flex flex-col items-center justify-center inset-0">
                                No Services Added
                              </div>
                            </div>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {!!selectedServices?.length && (
                    <div className="flex items-center justify-between w-full border-t border-gray-100">
                      <div className="p-4">
                        <div className="text-sm font-bold text-gray-500">
                          <div>Gross Total</div>
                        </div>
                        <div className="text-lg font-bold text-green-500">
                          ₱ {grossTotal}
                        </div>
                      </div>
                      <div className="flex items-center gap-x-4 p-4">
                        <Button
                          className="bg-red-500 text-white hover:bg-red-600"
                          onClick={() => setSelectedServices([])}
                        >
                          Clear
                        </Button>
                        <Button onClick={handleConfirmOrder}>
                          Confirm Order
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="fixed border-t border-gray-200 bottom-0 py-10 left-0 right-0 p-4 pl-[320px] bg-blue-400 text-white flex justify-between items-center"></div> */}
        <PaymentModal
          show={showModal}
          grossTotal={grossTotal}
          onClose={() => setShowModal(false)}
          onSubmit={() => {
            setShowModal(false);
          }}
        />
      </div>
    </div>
  );
};
