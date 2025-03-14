import * as React from "react";
import { cn } from "../../utils/utils"; // Adjust the path if needed

const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-md p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={cn("mb-4 space-y-1", className)} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ className, children, ...props }) => {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h2>
  );
};

const CardDescription = ({ className, children, ...props }) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={cn("text-sm", className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ className, children, ...props }) => {
  return (
    <div className={cn("mt-4 flex items-center justify-end gap-2", className)} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
