"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import {
  Tag,
  Plus,
  Calendar,
  Hash,
  FileText,
  CheckCircle,
  Save,
  X,
  Search,
} from "lucide-react";

import { yupResolver } from "@hookform/resolvers/yup";

import {
  Button,
  Datepicker,
  Input,
  Modal,
  Select,
} from "@/app/components/common";

import { customerRevalidateTag, upsertPromo } from "@/app/actions";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { PROMO_STATUS_DROPDOWN } from "@/app/constants";
import { PromoTable } from "./promo-table";

type MainPromoPageProps = {
  initialData: Array<Record<string, string>>;
  count: number;
};

export function MainPromoPage({ initialData, count }: MainPromoPageProps) {
  const { userId } = useCurrentUser();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const {
    reset,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      id: null,
      isUpdate: false,
      name: "",
      code: "",
      description: "",
      valid_until: "",
      status: "Active",
    },
    resolver: yupResolver(
      Yup.object().shape({
        id: Yup.string().nullable(),
        isUpdate: Yup.boolean(),
        name: Yup.string().required("This field is required"),
        code: Yup.string().required("This field is required"),
        description: Yup.string().required("This field is required"),
        status: Yup.string().required("This field is required"),
        valid_until: Yup.string().required("This field is required"),
      })
    ),
  });

  const isUpdate = watch("isUpdate", false);

  const handleModalClose = () => {
    reset({
      id: null,
      isUpdate: false,
      name: "",
      code: "",
      description: "",
      valid_until: "",
      status: "Active",
    });

    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Promo Management
          </h1>
          <p className="text-slate-600">
            Manage promotional campaigns and special offers
          </p>
        </div>
        <Button
          leftIcon={<Plus className="size-4" />}
          className="inline-flex items-center gap-x-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setShowModal(true)}
        >
          Add Promo
        </Button>
      </div>

      <div className="flex items-end gap-x-4">
        <div className="relative mt-4 w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by promo name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 h-12 bg-white pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-600 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-56">
          <Select
            options={[
              {
                label: "All Status",
                value: "",
              },
              {
                label: "Active",
                value: "Active",
              },
              {
                label: "Inactive",
                value: "Inactive",
              },
              {
                label: "Expired",
                value: "Expired",
              },
            ]}
            value={status}
            onChange={(value: any) => {
              setStatus(value?.value);
            }}
            placeholder="Select branch..."
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-col">
          <PromoTable
            initialData={initialData}
            count={count}
            search={debouncedSearch}
            status={status}
            onEdit={(promo) => {
              customerRevalidateTag("getPromos");
              reset({
                isUpdate: true,
                code: promo?.code,
                description: promo?.description,
                id: promo?.promo_id,
                name: promo?.name,
                status: promo?.status,
                valid_until: promo?.valid_until,
              });
              setShowModal(true);
            }}
          />
        </div>
      </div>
      <Modal
        show={showModal}
        title={
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            {isUpdate ? "Update Promo" : "Add Promo"}
          </div>
        }
        isSubmitting={isSubmitting}
        onClose={handleModalClose}
      >
        <Controller
          control={control}
          name="id"
          render={() => <Input containerClassName="hidden" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="name"
              render={({ field, formState: { errors } }) => (
                <div className="relative">
                  <Input
                    icon={<Tag />}
                    disabled={isSubmitting}
                    label="Promo Name"
                    placeholder="Enter promo name"
                    error={!!errors.name}
                    {...field}
                  />
                </div>
              )}
            />
          </div>
          <div className="col-span-1">
            <Controller
              control={control}
              name="code"
              render={({ field, formState: { errors } }) => (
                <div className="relative">
                  <Input
                    icon={<Hash />}
                    disabled={isSubmitting}
                    label="Promo Code"
                    placeholder="Enter promo code"
                    error={!!errors.code}
                    {...field}
                  />
                </div>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="description"
              render={({ field, formState: { errors } }) => (
                <div className="relative">
                  <Input
                    icon={<FileText />}
                    disabled={isSubmitting}
                    label="Description"
                    placeholder="Enter promo description"
                    error={!!errors.description}
                    {...field}
                  />
                </div>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="valid_until"
              render={({ field, formState: { errors } }) => (
                <div className="relative">
                  <Datepicker
                    icon={<Calendar />}
                    disabled={isSubmitting}
                    label="Valid Until"
                    placeholder="Select expiry date"
                    error={!!errors.valid_until}
                    {...field}
                  />
                </div>
              )}
            />
          </div>
          <div className="col-span-1">
            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, ...field } }) => (
                <div className="relative">
                  <Select
                    icon={<CheckCircle />}
                    label="Status"
                    placeholder="Select status"
                    isDisabled={!isUpdate}
                    options={PROMO_STATUS_DROPDOWN}
                    {...field}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={({ value }: any) => {
                      onChange(value);
                    }}
                  />
                </div>
              )}
            />
          </div>
        </div>
        {/* <div className="grid grid-cols-1 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="branches"
              render={({
                field: { value = [], onChange, ...field },
                formState: { errors },
              }) => (
                <BranchProvider
                  isMulti={true}
                  disabled={isSubmitting}
                  label="Branches"
                  placeholder="Branches"
                  error={!!errors?.branches}
                  {...field}
                  value={value as Array<string>}
                  onChange={(newValue) => {
                    const branchIds = convertToString(
                      newValue as Array<{ label: string; value: string }>
                    );

                    onChange(branchIds);
                  }}
                />
              )}
            />
          </div>
        </div> */}
        <div className="mt-8">
          <div className="flex justify-end items-center gap-x-2">
            <Button
              leftIcon={<X />}
              disabled={isSubmitting}
              className="bg-transparent text-blue-400 border focus:text-white focus border-blue-400 hover:bg-blue-400 hover:text-white inline-flex items-center gap-2"
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              leftIcon={<Save />}
              disabled={isSubmitting || !isDirty}
              className="inline-flex items-center gap-2"
              onClick={handleSubmit(async (newData) => {
                try {
                  const { error } = await upsertPromo({
                    p_promo_id: newData?.id as string,
                    p_name: newData?.name,
                    p_code: newData?.code,
                    p_description: newData?.description,
                    p_valid_until: newData?.valid_until,
                    p_status: newData?.status,
                    p_staff_id: userId!, // Use authenticated user ID
                  });
                  if (error) throw error;

                  handleModalClose();
                } catch (_error) {
                  console.error(_error);
                }
              })}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
