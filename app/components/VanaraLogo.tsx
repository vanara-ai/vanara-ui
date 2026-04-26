"use client";
import React from "react";

interface VanaraLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "text";
  className?: string;
}

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

export default function VanaraLogo({
  size = "md",
  variant = "full",
  className = "",
}: VanaraLogoProps) {
  const brand = (
    <span
      className={`font-semibold tracking-tight text-brand ${textSizeClasses[size]} ${className}`}
    >
      Vanara.ai
    </span>
  );

  if (variant === "icon" || variant === "text") return brand;

  return <div className="flex items-center">{brand}</div>;
}
