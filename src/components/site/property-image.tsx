"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * Thin `next/image` wrapper that renders nothing once the underlying URL
 * fails to load (e.g. a Storage object removed after a property was
 * deleted, or an old/broken external URL) instead of showing a broken-image
 * icon. Every call site already renders the `<Image>` inside a
 * `bg-piedra`-colored container, so failing silently just reveals that
 * neutral placeholder background — no layout shift, no broken-image icon.
 */
export function PropertyImage({ alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <Image {...props} alt={alt} onError={() => setFailed(true)} />;
}
