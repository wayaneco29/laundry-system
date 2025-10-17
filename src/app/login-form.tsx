"use client";

import { useRouter } from "next/navigation";
import { Input, Button } from "@/app/components/common";
import { User, Lock } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginUser } from "./actions/auth";
import { useToast } from "./hooks";
import { useState } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { handleSubmit, control, formState } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
    resolver: yupResolver(
      Yup.object().shape({
        username: Yup.string().required(),
        password: Yup.string().required(),
      })
    ),
  });
  const onSubmit = handleSubmit(
    async (data: { username: string; password: string }) => {
      try {
        const response = await loginUser({ ...data, rememberMe });

        if (response?.error) throw response?.error;

        setIsRedirecting(true);
        toast.success("Login successful! Redirecting...");
        router?.replace(response?.data!);
      } catch (error) {
        toast.error(typeof error !== "string" ? "Something went wrong" : error);
        setIsRedirecting(false);
      }
    }
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Email Input */}
      <Controller
        name="username"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div>
            <Input
              label="Username"
              disabled={formState?.isSubmitting || isRedirecting}
              placeholder="Enter your username"
              error={!!error}
              icon={<User />}
              {...field}
            />
          </div>
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div>
            <Input
              type="password"
              disabled={formState?.isSubmitting || isRedirecting}
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
            disabled={formState?.isSubmitting || isRedirecting}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={formState?.isSubmitting || isRedirecting}
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
    </form>
  );
}
