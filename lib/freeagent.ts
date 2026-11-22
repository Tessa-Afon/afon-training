// FreeAgent (freeagent.com) for invoices, credit notes and payments.
//
// The owner connects the site to FreeAgent once, from Admin > Settings
// (OAuth). The site then creates customers and invoices there and reads
// back whether they've been paid. FreeAgent does the bookkeeping, the
// bank matching and its own automatic reminders.
//
// Environment variables (server only):
//   FREEAGENT_CLIENT_ID, FREEAGENT_CLIENT_SECRET: from the app created at
//     dev.freeagent.com. Without them, invoicing stays manual, as in Phase 1.
//   FREEAGENT_ENV: "sandbox" (default) or "live".
//   FREEAGENT_API_BASE: only for testing against a stand-in server.
import { db } from "./supabase/admin";

const CLIENT_ID = process.env.FREEAGENT_CLIENT_ID;
const CLIENT_SECRET = process.env.FREEAGENT_CLIENT_SECRET;

export type FreeAgentEnv = "sandbox" | "live";
export const FREEAGENT_ENV: FreeAgentEnv = process.env.FREEAGENT_ENV === "live" ? "live" : "sandbox";

const API_BASE = (
  process.env.FREEAGENT_API_BASE ??
  (FREEAGENT_ENV === "live" ? "https://api.freeagent.com/v2" : "https://api.sandbox.freeagent.com/v2")
).replace(/\/$/, "");

/** True when the app keys are set, so the owner can connect. */
export const FREEAGENT_CONFIGURED = Boolean(CLIENT_ID && CLIENT_SECRET);

export class FreeAgentError extends Error {
  constructor(
    message: string,
    readonly status = 0,
  ) {
    super(message);
  }
}

export type Connection = {
  environment: FreeAgentEnv;
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
  company_name: string;
  connected_by: string;
  connected_at: string;
  last_sync_at: string | null;
  last_sync_result: string;
};

/** The saved connection for this environment, or null. A connection made
 *  against the sandbox is ignored once FREEAGENT_ENV is "live". */
export async function loadConnection(): Promise<Connection | null> {
  if (!FREEAGENT_CONFIGURED) return null;
  const { data, error } = await db().from("freeagent_connection").select("*").eq("id", 1).maybeSingle();
  if (error) {
    // Migration 0002 not run yet: treat as not connected.
    if (error.code === "42P01" || error.code === "PGRST205") return null;
    throw error;
  }
  if (!data || data.environment !== FREEAGENT_ENV) return null;
  return data as Connection;
}

export async function isConnected(): Promise<boolean> {
  return (await loadConnection()) !== null;
}

// ---- OAuth ---------------------------------------------------------------

/** Cookie holding the one-time check value while the owner is away at
 *  FreeAgent approving the connection. */
export const STATE_COOKIE = "afon_fa_state";

export function authoriseUrl(redirectUri: string, state: string): string {
  const q = new URLSearchParams({ client_id: CLIENT_ID!, response_type: "code", redirect_uri: redirectUri, state });
  return `${API_BASE}/approve_app?${q}`;
}

type TokenResponse = { access_token: string; refresh_token?: string; expires_in: number };

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/token_endpoint`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new FreeAgentError(`FreeAgent sign-in failed (${res.status}): ${await res.text()}`, res.status);
  return res.json();
}

const expiresAt = (seconds: number) => new Date(Date.now() + (seconds - 60) * 1000).toISOString();

/** Finishes connecting: swaps the code for tokens and saves them. */
export async function completeConnection(code: string, redirectUri: string, connectedBy: string): Promise<string> {
  const t = await tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirectUri });
  if (!t.refresh_token) throw new FreeAgentError("FreeAgent did not return a refresh token.");
  const company = await rawRequest<{ company: { name: string } }>(t.access_token, "GET", "/company").catch(() => null);
  const { error } = await db().from("freeagent_connection").upsert({
    id: 1,
    environment: FREEAGENT_ENV,
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    access_expires_at: expiresAt(t.expires_in),
    company_name: company?.company.name ?? "",
    connected_by: connectedBy,
    connected_at: new Date().toISOString(),
    last_sync_at: null,
    last_sync_result: "",
  });
  if (error) throw error;
  return company?.company.name ?? "";
}

export async function disconnect(): Promise<void> {
  const { error } = await db().from("freeagent_connection").delete().eq("id", 1);
  if (error) throw error;
}

export async function recordSync(result: string): Promise<void> {
  await db()
    .from("freeagent_connection")
    .update({ last_sync_at: new Date().toISOString(), last_sync_result: result })
    .eq("id", 1);
}

async function accessToken(): Promise<string> {
  const c = await loadConnection();
  if (!c) throw new FreeAgentError("FreeAgent is not connected. The owner can connect it in Settings.");
  if (new Date(c.access_expires_at).getTime() > Date.now()) return c.access_token;
  const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: c.refresh_token });
  const { error } = await db()
    .from("freeagent_connection")
    .update({
      access_token: t.access_token,
      refresh_token: t.refresh_token ?? c.refresh_token,
      access_expires_at: expiresAt(t.expires_in),
    })
    .eq("id", 1);
  if (error) throw error;
  return t.access_token;
}

// ---- Requests ------------------------------------------------------------

async function rawRequest<T>(token: string, method: string, pathOrUrl: string, body?: unknown): Promise<T> {
  // FreeAgent identifies things by full URL; accept either form.
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_BASE}${pathOrUrl}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Afon Training admin",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  if (!res.ok) {
    let detail = text.slice(0, 300);
    try {
      const j = JSON.parse(text);
      detail = (j.errors?.error?.message ?? j.errors?.map?.((e: { message: string }) => e.message).join("; ")) || detail;
    } catch {}
    throw new FreeAgentError(`FreeAgent said: ${detail || res.statusText} (${res.status})`, res.status);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

async function request<T>(method: string, pathOrUrl: string, body?: unknown): Promise<T> {
  return rawRequest<T>(await accessToken(), method, pathOrUrl, body);
}

// ---- Contacts ------------------------------------------------------------

export type InvoiceParty = {
  organisation: string;
  contactName: string;
  email: string;
  invoiceEmail: string;
  phone: string;
  invoiceAddress: string;
};

const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

/** Splits a typed address into FreeAgent's fields: up to three lines, a
 *  town and a postcode. Anything left over joins the third line. */
export function splitAddress(text: string) {
  const lines = text
    .split(/\r?\n|,/)
    .map((l) => l.trim())
    .filter(Boolean);
  let postcode = "";
  if (lines.length && UK_POSTCODE.test(lines[lines.length - 1])) postcode = lines.pop()!.toUpperCase();
  const town = lines.length > 1 ? lines.pop()! : "";
  const [address1 = "", address2 = "", ...rest] = lines;
  return { address1, address2, address3: rest.join(", "), town, postcode };
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return { first_name: parts.slice(0, -1).join(" ") || parts[0] || "", last_name: parts.length > 1 ? parts[parts.length - 1] : "" };
}

const contactKey = (p: InvoiceParty) => `${p.organisation.trim().toLowerCase()}|${(p.invoiceEmail || p.email).trim().toLowerCase()}`;

/** The FreeAgent contact for this organisation, created the first time. */
export async function ensureContact(p: InvoiceParty): Promise<string> {
  const key = contactKey(p);
  const found = await db()
    .from("freeagent_contacts")
    .select("contact_url")
    .eq("key", key)
    .eq("environment", FREEAGENT_ENV)
    .maybeSingle();
  if (found.error) throw found.error;
  if (found.data) return found.data.contact_url;

  const { contact } = await request<{ contact: { url: string } }>("POST", "/contacts", {
    contact: {
      organisation_name: p.organisation,
      ...splitName(p.contactName),
      email: p.email,
      billing_email: p.invoiceEmail || p.email,
      phone_number: p.phone,
      ...splitAddress(p.invoiceAddress),
      country: "United Kingdom",
      contact_name_on_invoices: true,
    },
  });
  const { error } = await db()
    .from("freeagent_contacts")
    .upsert({ key, environment: FREEAGENT_ENV, contact_url: contact.url });
  if (error) throw error;
  return contact.url;
}

// ---- Invoices and credit notes -------------------------------------------

export type FaInvoice = {
  url: string;
  reference: string;
  status: string;
  dated_on: string;
  due_on?: string;
  total_value: string;
  paid_value?: string;
  due_value?: string;
};

export type FaCreditNote = {
  url: string;
  reference: string;
  status: string;
  dated_on: string;
  total_value: string;
  refunded_value?: string;
  due_value?: string;
};

export type InvoiceLine = { description: string; quantity: number; price: number };

export async function createInvoice(opts: {
  contactUrl: string;
  datedOn: string;
  paymentTermsDays: number;
  poReference: string;
  comments: string;
  lines: InvoiceLine[];
}): Promise<FaInvoice> {
  const { invoice } = await request<{ invoice: FaInvoice }>("POST", "/invoices", {
    invoice: {
      contact: opts.contactUrl,
      dated_on: opts.datedOn,
      payment_terms_in_days: opts.paymentTermsDays,
      ...(opts.poReference ? { po_reference: opts.poReference } : {}),
      comments: opts.comments,
      currency: "GBP",
      invoice_items: opts.lines.map((l) => ({
        item_type: "Training",
        description: l.description,
        quantity: String(l.quantity),
        price: l.price.toFixed(2),
      })),
    },
  });
  return invoice;
}

export async function markInvoiceSent(url: string): Promise<void> {
  await request("PUT", `${url}/transitions/mark_as_sent`);
}

export type EmailContent = { to: string; subject: string; body: string };

/** FreeAgent emails the invoice itself, with the PDF attached. */
export async function emailInvoice(url: string, email: EmailContent): Promise<void> {
  await request("POST", `${url}/send_email`, { invoice: { email } });
}

export async function getInvoice(url: string): Promise<FaInvoice> {
  return (await request<{ invoice: FaInvoice }>("GET", url)).invoice;
}

export async function createCreditNote(opts: {
  contactUrl: string;
  datedOn: string;
  comments: string;
  lines: InvoiceLine[];
}): Promise<FaCreditNote> {
  const { credit_note } = await request<{ credit_note: FaCreditNote }>("POST", "/credit_notes", {
    credit_note: {
      contact: opts.contactUrl,
      dated_on: opts.datedOn,
      payment_terms_in_days: 0,
      comments: opts.comments,
      currency: "GBP",
      credit_note_items: opts.lines.map((l) => ({
        item_type: "Training",
        description: l.description,
        quantity: String(l.quantity),
        // Credit notes carry negative amounts in FreeAgent.
        price: (-Math.abs(l.price)).toFixed(2),
      })),
    },
  });
  return credit_note;
}

export async function markCreditNoteSent(url: string): Promise<void> {
  await request("PUT", `${url}/transitions/mark_as_sent`);
}

export async function emailCreditNote(url: string, email: EmailContent): Promise<void> {
  await request("POST", `${url}/send_email`, { credit_note: { email } });
}

export async function getCreditNote(url: string): Promise<FaCreditNote> {
  return (await request<{ credit_note: FaCreditNote }>("GET", url)).credit_note;
}

/** Sets a credit note against an unpaid invoice, so the invoice shows as
 *  settled by that amount. */
export async function applyCreditNote(creditNoteUrl: string, invoiceUrl: string, amount: number, datedOn: string) {
  await request("POST", "/credit_note_reconciliations", {
    credit_note_reconciliation: {
      credit_note: creditNoteUrl,
      invoice: invoiceUrl,
      gross_value: amount.toFixed(2),
      dated_on: datedOn,
      currency: "GBP",
    },
  });
}
