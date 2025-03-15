import * as React from "react";
import { cn } from "../../utils/utils";

const Label = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
});
Label.displayName = "Label";

export { Label };
