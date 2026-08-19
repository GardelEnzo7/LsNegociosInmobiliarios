"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

const CLARITY_PROJECT_ID = "y4u8ldnf4l";

// Module-level, not state: survives remounts (route changes don't remount
// this layout, but this still keeps a second re-run from ever calling
// Clarity.init twice). Clarity's own injectScript() is already idempotent
// (it checks for an existing #clarity-script tag before inserting another),
// so this is a second, cheaper guard on top of that, not a replacement.
let clarityInitialized = false;

/**
 * Client-only, render-nothing component that loads Microsoft Clarity.
 * Production only — local dev traffic isn't real visitor behavior and
 * would just add noise to session recordings.
 */
export function ClarityAnalytics() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || clarityInitialized) return;
    clarityInitialized = true;
    Clarity.init(CLARITY_PROJECT_ID);
  }, []);

  return null;
}
