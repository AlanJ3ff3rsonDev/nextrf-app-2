"use client";

import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  };

  const imageSizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden",
        "bg-primary-100 flex items-center justify-center",
        "font-bold text-primary-600",
        sizes[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-cover w-full h-full"
        />
      ) : (
        <span>{name ? getInitials(name) : "?"}</span>
      )}
    </div>
  );
}

// Avatar with status indicator
interface AvatarWithStatusProps extends AvatarProps {
  status?: "active" | "warning" | "inactive" | "online";
}

function AvatarWithStatus({
  status,
  className,
  ...props
}: AvatarWithStatusProps) {
  const statusColors = {
    active: "bg-success-500",
    warning: "bg-warning-500",
    inactive: "bg-error-500",
    online: "bg-success-500",
  };

  return (
    <div className="relative inline-block">
      <Avatar {...props} className={className} />
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0",
            "w-3 h-3 rounded-full border-2 border-white",
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}

export { Avatar, AvatarWithStatus };
