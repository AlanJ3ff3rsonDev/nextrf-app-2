"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, hint, leftIcon, rightIcon, id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-12 px-4 rounded-2xl",
              "bg-white border-2 border-border",
              "text-foreground placeholder:text-muted-foreground",
              "transition-all duration-200",
              "hover:border-primary-300",
              "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
              "disabled:bg-muted disabled:cursor-not-allowed",
              leftIcon && "pl-12",
              rightIcon && "pr-12",
              error && "border-error-500 focus:border-error-500 focus:ring-error-500/20",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
        )}
        {error && <p className="mt-2 text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
