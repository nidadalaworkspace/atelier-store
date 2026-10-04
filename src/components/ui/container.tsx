import { cn } from "@/lib/cn";
import type { ComponentPropsWithoutRef, ElementType } from "react";

type Width = "page" | "wide" | "prose";

type ContainerProps<T extends ElementType> = {
  as?: T;
  width?: Width;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

const widthClass: Record<Width, string> = {
  page: "container-page",
  wide: "container-wide",
  prose: "container-prose",
};

export function Container<T extends ElementType = "div">({
  as,
  width = "page",
  className,
  ...rest
}: ContainerProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return <Component className={cn(widthClass[width], className)} {...rest} />;
}
