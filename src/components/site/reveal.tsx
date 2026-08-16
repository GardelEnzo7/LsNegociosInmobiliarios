"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li";
};

export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = node.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight * 0.92;

    if (reduceMotion || alreadyInView) return;

    setHidden(true);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || !hidden) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hidden, delay]);

  const Comp = as;

  return (
    <Comp
      ref={ref as never}
      className={cn(hidden && "reveal-hidden", visible && "reveal-visible", className)}
    >
      {children}
    </Comp>
  );
}
