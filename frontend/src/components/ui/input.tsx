import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = "", type = "text", ...props }, ref) => {
  const classes = [
    "flex h-10 w-full rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <input ref={ref} type={type} className={classes} {...props} />;
});
Input.displayName = "Input";

export default Input;
