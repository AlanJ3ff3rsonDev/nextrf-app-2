"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center gap-2",
      "font-semibold rounded-2xl",
      "transition-all duration-200 ease-out",
      "active:scale-95",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    );

    const variants = {
      primary: cn(
        "bg-primary-500 text-white",
        "hover:bg-primary-600",
        "shadow-soft hover:shadow-medium"
      ),
      secondary: cn(
        "bg-secondary-500 text-white",
        "hover:bg-secondary-600",
        "shadow-soft hover:shadow-medium"
      ),
      outline: cn(
        "border-2 border-primary-500 text-primary-500",
        "hover:bg-primary-50"
      ),
      ghost: cn("text-primary-500", "hover:bg-primary-50"),
      danger: cn(
        "bg-error-500 text-white",
        "hover:bg-error-600",
        "shadow-soft hover:shadow-medium"
      ),
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
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
  );
}

export { Button };
