import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm rounded-md gap-1.5",
  md: "h-11 px-5 text-sm rounded-md gap-2",
  lg: "h-13 px-7 text-base rounded-lg gap-2.5",
};

const variantClasses: Record<ButtonVariant, string> = {
  // Design.md §7.1: gradient background, hover shifts gradient position.
  primary:
    "text-white bg-iridescent bg-[length:200%_100%] bg-left hover:bg-right shadow-[0_12px_24px_-8px_rgba(139,92,246,0.45)] transition-[background-position,box-shadow] duration-300",
  secondary:
    "text-surface bg-transparent border border-neutral-200 hover:border-iri-violet hover:text-iri-violet transition-colors",
  ghost: "text-surface-muted hover:text-surface hover:bg-neutral-200/60 transition-colors",
  danger: "text-white bg-danger hover:brightness-110 transition-[filter]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-medium select-none",
        "disabled:opacity-50 disabled:pointer-events-none",
        "active:scale-[0.98] transition-transform",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
});
