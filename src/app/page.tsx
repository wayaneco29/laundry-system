import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { LoginForm } from "./login-form";
import Image from "next/image";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 mb-4">
              <Image
                src="/logo.svg"
                alt="Laundry Logo"
                width={80}
                height={80}
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to access your laundry management system
            </p>
          </div>

          <LoginForm />

          {/* Footer */}
          {/* <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <a 
                href="#" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Contact your administrator
              </a>
            </p>
          </div> */}
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
