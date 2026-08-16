"use client";

import { useEffect, useRef } from "react";
import { incrementPropertyViews } from "@/app/actions/track-view";

export function TrackPropertyView({ propertyId }: { propertyId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    incrementPropertyViews(propertyId);
  }, [propertyId]);

  return null;
}
