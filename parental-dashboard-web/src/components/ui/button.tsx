"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative overflow-hidden flex items-center justify-between transition-all duration-200",
  {
    variants: {
      variant: {
        primary: [
          "cursor-pointer",
          "py-3 px-4 rounded-full font-semibold text-base",
          "bg-blue-600 text-white",
          "hover:bg-blue-700",
          "disabled:cursor-not-allowed disabled:bg-blue-300",
          "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        ].join(" "),
        destructive: [
          "cursor-pointer",
          "bg-red-600 text-white shadow-sm",
          "hover:bg-red-700",
          "disabled:cursor-not-allowed disabled:bg-red-300 disabled:text-red-100",
          "focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
        ].join(" "),
        outline: [
          "cursor-pointer",
          "border border-neutral-200 bg-white rounded-2xl text-neutral-700 font-medium",
          "hover:bg-neutral-100",
          "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 disabled:border-neutral-200",
          "focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2",
        ].join(" "),
        secondary: [
          "cursor-pointer",
          "bg-gray-100 text-gray-900 shadow-sm",
          "hover:bg-gray-200",
          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
          "focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2",
        ].join(" "),
        ghost: [
          "cursor-pointer rounded-full",
          "hover:bg-neutral-100 hover:text-neutral-700",
          "disabled:cursor-not-allowed disabled:text-neutral-400 disabled:hover:bg-transparent",
          "focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2",
        ].join(" "),
        link: [
          "cursor-pointer",
          "text-blue-600 underline-offset-4",
          "hover:underline",
          "disabled:cursor-not-allowed disabled:text-blue-300 disabled:hover:no-underline",
          "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        ].join(" "),
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        md: "px-4 py-3",
        lg: "px-4 py-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

// Ripple color mapping per variant
const rippleColors: Record<
  NonNullable<VariantProps<typeof buttonVariants>["variant"]>,
  string
> = {
  primary: "rgba(0, 0, 0, 0.1)",
  destructive: "rgba(255, 255, 255, 0.35)",
  outline: "rgba(0, 0, 0, 0.1)",
  secondary: "rgba(0, 0, 0, 0.1)",
  ghost: "rgba(0, 0, 0, 0.1)",
  link: "rgba(59, 130, 246, 0.2)",
};

function useRipple() {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const rippleHostRef = React.useRef<HTMLSpanElement | null>(null);

  const createRipple = React.useCallback(
    (
      event: React.PointerEvent<HTMLElement>,
      variant: keyof typeof rippleColors
    ) => {
      try {
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        const maxX = Math.max(clickX, rect.width - clickX);
        const maxY = Math.max(clickY, rect.height - clickY);
        const radius = Math.sqrt(maxX * maxX + maxY * maxY);
        const diameter = radius * 2;

        const ripple = document.createElement("span");
        ripple.className =
          "pointer-events-none absolute rounded-full will-change-transform opacity-40 transition-[transform,opacity] duration-700 ease-out";
        ripple.style.left = `${clickX}px`;
        ripple.style.top = `${clickY}px`;
        ripple.style.width = `${diameter}px`;
        ripple.style.height = `${diameter}px`;
        ripple.style.marginLeft = `${-radius}px`;
        ripple.style.marginTop = `${-radius}px`;
        ripple.style.transform = "scale(0)";
        ripple.style.background = rippleColors[variant];
        ripple.style.mixBlendMode =
          variant === "destructive" ? "overlay" : "multiply";

        const host = rippleHostRef.current ?? target;
        host.appendChild(ripple);

        requestAnimationFrame(() => {
          ripple.style.transform = "scale(1)";
          ripple.style.opacity = "0";
        });

        window.setTimeout(() => {
          ripple.remove();
        }, 800);
      } catch {
        // no-op
      }
    },
    []
  );

  return { buttonRef, rippleHostRef, createRipple };
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  onPointerDown,
  children,
  ...props
}: React.ComponentProps<"button"> &
  Omit<VariantProps<typeof buttonVariants>, "size"> & {
    size?: "default" | "sm" | "md" | "lg" | "icon";
    asChild?: boolean;
  }) {
  const { buttonRef, rippleHostRef, createRipple } = useRipple();

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      onPointerDown?.(
        event as unknown as React.PointerEvent<HTMLButtonElement>
      );
      if (
        (event as unknown as React.PointerEvent<HTMLButtonElement>)
          .defaultPrevented
      )
        return;

      // prevent ripple when disabled
      if ((props as React.ComponentProps<"button">).disabled) return;

      const v = (variant ?? "primary") as keyof typeof rippleColors;
      createRipple(event, v);
    },
    [onPointerDown, props, variant, createRipple]
  );

  // Ensure Slot receives a single valid React element child when asChild is true
  const slotChild = asChild
    ? (React.Children.toArray(children).find((child) =>
        React.isValidElement(child)
      ) as React.ReactElement | undefined)
    : undefined;

  const mergedClassName = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    if (!slotChild) {
      return null;
    }

    const childOnPointerDown = (slotChild.props as any)?.onPointerDown as
      | ((e: React.PointerEvent<HTMLElement>) => void)
      | undefined;

    const combinedOnPointerDown = (e: React.PointerEvent<HTMLElement>) => {
      childOnPointerDown?.(e);
      handlePointerDown(e);
    };

    return React.cloneElement(
      slotChild as React.ReactElement<any>,
      {
        "data-slot": "button",
        ref: buttonRef as unknown as React.Ref<any>,
        onPointerDown: combinedOnPointerDown,
        className: cn((slotChild.props as any)?.className, mergedClassName),
        ...(props as any),
      } as any
    );
  }

  return (
    <button
      data-slot="button"
      ref={buttonRef as unknown as React.Ref<any>}
      onPointerDown={handlePointerDown}
      className={mergedClassName}
      {...(props as React.ComponentProps<"button">)}
    >
      {children}
      <span
        aria-hidden="true"
        ref={rippleHostRef}
        className="pointer-events-none absolute inset-0"
      />
    </button>
  );
}

export { Button, buttonVariants };
