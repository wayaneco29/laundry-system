import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-white">
      <h1 className="text-4xl font-bold mb-4 text-gray-700">
        404 - Page Not Found
      </h1>
      <p className="text-lg mb-8 text-gray-500">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="hover:underline p-3 px-6 bg-blue-500 rounded-md text-white"
      >
        Go back to the Login Page
      </Link>
    </div>
  );
}
