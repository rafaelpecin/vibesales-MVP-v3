import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[8px] border border-[#E2E8F0] bg-white px-3 py-2 text-[14px] text-[#1A1F2E] placeholder:text-[#64748B] transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-[#1A7A4A] focus-visible:ring-[3px] focus-visible:ring-[rgba(26,122,74,0.12)] disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:opacity-70",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
