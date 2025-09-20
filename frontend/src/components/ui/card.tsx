import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

type CardSectionProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className = "", ...props }, ref) => {
  const classes = [
    "rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 shadow-sm backdrop-blur",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <div ref={ref} className={classes} {...props} />;
});
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(({ className = "", ...props }, ref) => {
  const classes = ["flex flex-col space-y-1.5 p-6", className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});
CardHeader.displayName = "CardHeader";

export const CardContent = React.forwardRef<HTMLDivElement, CardSectionProps>(({ className = "", ...props }, ref) => {
  const classes = ["p-6 pt-0", className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(({ className = "", ...props }, ref) => {
  const classes = ["flex items-center p-6 pt-0", className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});
CardFooter.displayName = "CardFooter";

export default Card;
