import { twMerge } from "tailwind-merge";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  label?: string;
};

export const Input = ({
  label,
  error,
  className = "",
  ...props
}: InputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        className={twMerge(
          "py-2.5 sm:py-3 px-4 block w-full border border-gray-200 rounded-lg sm:text-sm focus-visible:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:pointer-events-none",
          error && "border-red-400 focus:border-red-400 focus:ring-red-400",
          className
        )}
        {...props}
      />
    </div>
  );
};
