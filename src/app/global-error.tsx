"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <h1 className="text-gray-700 text-2xl font-medium">
        Something went wrong!
      </h1>
      <p className="text-gray-700">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-400 text-white hover:bg-blue-500 focus:outline-hidden focus:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none"
      >
        Try again
      </button>
    </div>
  );
}
