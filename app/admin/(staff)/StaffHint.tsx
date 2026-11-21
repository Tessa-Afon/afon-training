"use client";
import { useEffect } from "react";
import { STAFF_HINT_COOKIE, STAFF_HINT_MAX_AGE } from "@/lib/staff-hint";

// Remembers that this browser is used by staff, for the Admin menu link.
export default function StaffHint() {
  useEffect(() => {
    document.cookie = `${STAFF_HINT_COOKIE}=1; path=/; max-age=${STAFF_HINT_MAX_AGE}; samesite=lax; secure`;
  }, []);
  return null;
}
