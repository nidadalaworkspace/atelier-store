import { cn } from "@/lib/cn";
import type { ComponentPropsWithoutRef } from "react";

export function Eyebrow({
  className,
  ...rest
}: ComponentPropsWithoutRef<"span">) {
  return <span className={cn("eyebrow", className)} {...rest} />;
}
