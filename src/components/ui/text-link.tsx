import NextLink from "next/link";
import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

type Variant = "hover" | "static";

type TextLinkProps = ComponentProps<typeof NextLink> & {
  variant?: Variant;
};

export function TextLink({
  variant = "hover",
  className,
  ...rest
}: TextLinkProps) {
  return (
    <NextLink
      className={cn(variant === "hover" ? "link" : "link-static", className)}
      {...rest}
    />
  );
}
