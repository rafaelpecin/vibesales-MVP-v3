import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-[#1A7A4A] text-white hover:bg-[#155e3a] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(26,122,74,0.25)]",
  destructive:
    "bg-[#EF4444] text-white hover:bg-[#dc2626] hover:-translate-y-px",
  outline:
    "border border-[#1B4F8A] bg-transparent text-[#1B4F8A] hover:bg-[rgba(27,79,138,0.06)] hover:-translate-y-px",
  secondary:
    "bg-[#1B4F8A] text-white hover:bg-[#163f6e] hover:-translate-y-px",
  ghost:
    "text-[#1A1F2E] hover:bg-[rgba(26,122,74,0.06)] hover:text-[#1A7A4A]",
  link: "text-[#1A7A4A] underline-offset-4 hover:underline",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-10 px-5 py-2 text-sm",
  sm: "h-8 rounded-[6px] px-3 text-xs",
  lg: "h-12 rounded-[8px] px-6 text-sm",
  icon: "h-10 w-10",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-[8px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A7A4A] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
