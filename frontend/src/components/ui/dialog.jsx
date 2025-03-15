import * as React from "react";
import { cn } from "../../utils/utils";

const Dialog = ({ open, onOpenChange, children, className }) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
        open ? "visible" : "hidden",
        className
      )}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-md bg-background p-6 rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className }) => (
  <div className={cn("space-y-4", className)}>{children}</div>
);

const DialogHeader = ({ children, className }) => (
  <div className={cn("text-lg font-semibold", className)}>{children}</div>
);

const DialogTitle = ({ children, className }) => (
  <h2 className={cn("text-xl font-bold", className)}>{children}</h2>
);

const DialogDescription = ({ children, className }) => (
  <p className={cn("text-muted-foreground", className)}>{children}</p>
);

const DialogFooter = ({ children, className }) => (
  <div className={cn("flex justify-end space-x-2", className)}>{children}</div>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
