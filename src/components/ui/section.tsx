import { cn } from "@/lib/cn";
import type { ComponentPropsWithoutRef, ElementType } from "react";

type SectionProps<T extends ElementType> = {
  as?: T;
  bleed?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function Section<T extends ElementType = "section">({
  as,
  bleed = false,
  className,
  ...rest
}: SectionProps<T>) {
  const Component = (as ?? "section") as ElementType;
  return (
    <Component
      className={cn("section", bleed && "bleed", className)}
      {...rest}
    />
  );
}
