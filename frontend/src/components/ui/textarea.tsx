import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[140px] w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base font-medium text-foreground shadow-3d-xs transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-glow-sm hover:border-border/80 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
