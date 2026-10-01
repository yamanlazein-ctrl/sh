"use client";

import React, { useEffect, useRef, useState } from "react";

export type RevealVariant =
  | "up" // rises from below
  | "wipe" // uncovered from right to left
  | "curtain" // uncovered from bottom to top
  | "zoom" // grows in
  | "blur" // comes into focus
  | "left" // slides in from the left
  | "right" // slides in from the right
  | "tilt" // tips forward into place
  | "spin"; // turns into place

/** true once the element has entered the viewport (fires once) */
export function useInView<T extends Element>(margin = "0px 0px -15% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, margin]);
  return { ref, inView };
}

export default function Reveal({
  variant = "up",
  delay = 0,
  as = "div",
  className = "",
  style,
  children,
  ...rest
}: {
  variant?: RevealVariant;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "style" | "className" | "children">) {
  const { ref, inView } = useInView<HTMLElement>();
  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      data-in={inView ? "" : undefined}
      className={className}
      style={{ ...style, ["--d" as string]: `${delay}s` } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}
