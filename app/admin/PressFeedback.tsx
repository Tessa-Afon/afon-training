"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// How long a button may show as working before it's let go anyway.
const GIVE_UP_MS = 90_000;

type Pressed = { kind: "form" | "link"; at: number };

/**
 * Every admin button and link shows it's been pressed (22 Nov 2026, Peter
 * clicked "Confirm and invoice" twice; same pattern as ControlNow).
 *
 * - Pressing: buttons dip (globals.css, .admin-press).
 * - Working: the button is striped and busy, a bar runs along the top and
 *   "Working…" shows at the bottom, until the action finishes or the next
 *   page arrives. While a form is working, pressing it again does nothing,
 *   so an invoice can't be raised twice by a double click.
 * - Done: "✓ Done" shows for a moment.
 */
export default function PressFeedback() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const pending = useRef(new Map<Element, Pressed>());
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(0);

  useEffect(() => {
    const map = pending.current;
    const sync = () => setBusy(map.size > 0);
    const mark = (el: Element, kind: Pressed["kind"]) => {
      el.setAttribute("data-pressed", "pending");
      el.setAttribute("aria-busy", "true");
      map.set(el, { kind, at: Date.now() });
      sync();
    };
    const release = (el: Element) => {
      el.removeAttribute("aria-busy");
      if (el.getAttribute("data-pressed") === "pending") el.removeAttribute("data-pressed");
      map.delete(el);
    };
    const formBusy = (form: HTMLFormElement) =>
      [...map.entries()].some(([el, p]) => p.kind === "form" && (el === form || form.contains(el)));

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.hasAttribute("download") || (a.target && a.target !== "_self")) return;
      let to: URL;
      try {
        to = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (to.origin !== location.origin) return;
      if (to.pathname === location.pathname && to.search === location.search) return;
      mark(a, "link");
    };
    // Capture phase, so a second press is stopped before React sends it.
    const onSubmitCapture = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement | null;
      if (form && formBusy(form)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    // Bubble phase: after the form's own onSubmit has had its say.
    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement | null;
      if (!form) return;
      const button = e.submitter ?? form.querySelector("button:not([type=button]), input[type=submit]") ?? form;
      mark(button, "form");
    };
    // React resets a form once its action has finished.
    const onReset = (e: Event) => {
      const form = e.target as HTMLFormElement;
      let finished = false;
      for (const el of [...map.keys()]) {
        if (map.get(el)?.kind === "form" && (el === form || form.contains(el))) {
          release(el);
          finished = true;
        }
      }
      sync();
      if (finished) setTimeout(() => setToast((n) => n + 1), 120);
    };

    window.addEventListener("submit", onSubmitCapture, true);
    window.addEventListener("submit", onSubmit);
    document.addEventListener("click", onClick, true);
    document.addEventListener("reset", onReset, true);
    const sweep = setInterval(() => {
      if (!map.size) return;
      for (const [el, p] of map) if (!el.isConnected || Date.now() - p.at > GIVE_UP_MS) release(el);
      sync();
    }, 1000);
    return () => {
      window.removeEventListener("submit", onSubmitCapture, true);
      window.removeEventListener("submit", onSubmit);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("reset", onReset, true);
      clearInterval(sweep);
    };
  }, []);

  // A new page or address: whatever was pressed has landed.
  useEffect(() => {
    const map = pending.current;
    if (!map.size) return;
    const fromForm = [...map.values()].some((p) => p.kind === "form");
    for (const el of map.keys()) {
      el.removeAttribute("aria-busy");
      el.removeAttribute("data-pressed");
    }
    map.clear();
    setBusy(false);
    if (fromForm) setToast((n) => n + 1);
  }, [pathname, search]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(0), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      <div className="press-bar" data-on={busy ? "true" : undefined} aria-hidden="true" />
      <div role="status" aria-live="polite" className="press-toast" data-on={busy || toast ? "true" : undefined}>
        {busy ? <><span className="press-spin" aria-hidden="true" />Working…</> : toast ? "✓ Done" : ""}
      </div>
    </>
  );
}
