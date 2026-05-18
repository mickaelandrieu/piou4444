import { http, HttpResponse } from "msw";

// Placeholder for HTTP handlers.
// Handlers for Stripe, Brevo, and Supabase are added in spec 004.

export const handlers: ReturnType<typeof http.get>[] = [];

export { http, HttpResponse };
