"use client";

import { useRouter } from "next/navigation";
import { Input, Button, Select } from "@/app/components/common";
import { User, Lock, Building2, ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginUser, checkUsername, Branch } from "./actions/auth";
import { useToast } from "./hooks";
import { useState } from "react";

type LoginStep = "username" | "password";

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().default(""),
  branchId: Yup.string().default(""),
});

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [step, setStep] = useState<LoginStep>("username");
  const [isAdmin, setIsAdmin] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const { handleSubmit, control, formState, getValues, trigger, setError, clearErrors, watch } = useForm({
    defaultValues: {
      username: "",
      password: "",
      branchId: "",
    },
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  // Watch username to reactively enable/disable the Continue button
  const usernameValue = watch("username");

  const handleContinue = async () => {
    const isValid = await trigger("username");
    if (!isValid) return;

    const username = getValues("username");
    setIsChecking(true);

    try {
      const result = await checkUsername(username);

      if (result.error) {
        toast.error(result.error);
        setIsChecking(false);
        return;
      }

      if (result.data) {
        setIsAdmin(result.data.isAdmin);
        setBranches(result.data.branches);
        setStep("password");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsChecking(false);
    }
  };

  const handleBack = () => {
    setStep("username");
    setIsAdmin(false);
    setBranches([]);
  };

  const onSubmit = handleSubmit(async (data) => {
    // Validate password
    if (!data.password) {
      setError("password", { message: "Password is required" });
      return;
    }

    // Validate branch for staff
    if (!isAdmin && branches.length > 0 && !data.branchId) {
      setError("branchId", { message: "Please select a branch" });
      return;
    }

    try {
      const response = await loginUser({
        username: data.username,
        password: data.password,
        branchId: data.branchId || undefined,
        rememberMe,
      });

      if (response?.error) throw response?.error;

      setIsRedirecting(true);
      toast.success("Login successful! Redirecting...");
      router?.replace(response?.data!);
    } catch (error) {
      toast.error(typeof error !== "string" ? "Something went wrong" : error);
      setIsRedirecting(false);
    }
  });

  const branchOptions = branches.map((branch) => ({
    value: branch.id,
    label: branch.name,
  }));

  const isLoading = formState?.isSubmitting || isRedirecting || isChecking;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Username Input - Always visible but disabled after continue */}
      <Controller
        name="username"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div>
            <Input
              label="Username"
              disabled={isLoading || step === "password"}
              placeholder="Enter your username"
              error={!!error}
              icon={<User />}
              {...field}
            />
          </div>
        )}
      />

      {/* Password step content */}
      {step === "password" && (
        <>
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={isLoading}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Change username
          </button>

          {/* Branch selection for staff */}
          {!isAdmin && branches.length > 0 && (
            <Controller
              name="branchId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Select Branch"
                  placeholder="Choose your branch..."
                  options={branchOptions}
                  value={field.value}
                  onChange={(option) => {
                    const selected = option as { value: string } | null;
                    field.onChange(selected?.value || "");
                    clearErrors("branchId");
                  }}
                  isDisabled={isLoading}
                  error={!!error}
                  icon={<Building2 />}
                />
              )}
            />
          )}

          {/* No branches warning for staff */}
          {!isAdmin && branches.length === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No branches assigned to this account. Please contact your administrator.
              </p>
            </div>
          )}

          {/* Password Input */}
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div>
                <Input
                  type="password"
                  disabled={isLoading}
                  label="Password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={!!error}
                  icon={<Lock />}
                  {...field}
                />
              </div>
            )}
          />

          {/* Remember Me */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
          </div>
        </>
      )}

      {/* Action Button */}
      {step === "username" ? (
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isLoading || !usernameValue}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isChecking ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Checking...
            </div>
          ) : (
            "Continue"
          )}
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={isLoading || (!isAdmin && branches.length === 0)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {formState?.isSubmitting || isRedirecting ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {isRedirecting ? "Redirecting..." : "Signing in..."}
            </div>
          ) : (
            "Sign In"
          )}
        </Button>
      )}
    </form>
  );
}
