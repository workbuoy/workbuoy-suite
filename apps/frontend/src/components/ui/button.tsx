import React from "react";

type ButtonVariant = "default" | "outline" | "ghost" | "secondary";
type ButtonSize = "default" | "sm" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseClass = "inline-flex items-center justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition";
const variants: Record<ButtonVariant, string> = {
  default: "bg-indigo-600 text-white hover:bg-indigo-500",
  outline: "border-slate-500 text-slate-100 hover:bg-slate-800",
  ghost: "bg-transparent text-slate-100 hover:bg-slate-800/60",
  secondary: "bg-slate-700 text-white hover:bg-slate-600",
};
const sizes: Record<ButtonSize, string> = {
  default: "h-10",
  sm: "h-8 text-xs px-2",
  lg: "h-12 text-base px-5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", type = "button", ...props }, ref) => {
    const classes = [baseClass, variants[variant] ?? variants.default, sizes[size] ?? sizes.default, className]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} type={type} className={classes} {...props} />;
  }
);
Button.displayName = "Button";

export default Button;
