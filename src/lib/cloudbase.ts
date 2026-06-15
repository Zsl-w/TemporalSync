/**
 * CloudBase SDK initialization + database helpers.
 *
 * Auth strategy: Auto anonymous sign-in on page load (no login UI needed).
 * Production CORS: Fetch interceptor routes API calls through /tcb-proxy/*
 * to bypass CloudBase free-tier domain restrictions.
 */

import cloudbase from "@cloudbase/js-sdk";

// ============================================================
// Fetch interceptor for production CORS bypass
// ============================================================
const _nativeFetch = globalThis.fetch.bind(globalThis);
const CLOUDBASE_GATEWAY_PATTERN = /\.api\.tcloudbasegateway\.com\//;

const isProduction = typeof window !== "undefined"
  && window.location
  && !window.location.hostname.includes("localhost")
  && !window.location.hostname.includes("127.0.0.1");

if (isProduction) {
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (CLOUDBASE_GATEWAY_PATTERN.test(url)) {
      const parsed = new URL(url);
      const proxyPath = "/tcb-proxy/" + parsed.pathname.replace(/^\//, "") + parsed.search;
      return _nativeFetch(proxyPath, init);
    }
    return _nativeFetch(input, init);
  };
}

// ============================================================
// CloudBase SDK init
// ============================================================
const ENV_ID = "tsync-d3g3w7jmab93b9b25";
const REGION = "ap-shanghai";
const ACCESS_KEY =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9." +
  "eyJpc3MiOiJodHRwczovL3RzeW5jLWQzZzN3N2ptYWI5M2I5YjI1LmFwLXNoYW5naGFpLnRjYi1hcGkudGVuY2VudGNsb3VkYXBpLmNvbSIsInN1YiI6ImFub24iLCJhdWQiOiJ0c3luYy1kM2czdzdqbWFiOTNiOWIyNSIsImV4cCI6NDA4NTE3MjcyMywiaWF0IjoxNzgxNDg5NTIzLCJub25jZSI6ImdDQ0FRSENmU0VXOFV1dXNtMnNHcGciLCJhdF9oYXNoIjoiZ0NDQVFIQ2ZTRVc4VXV1c20yc0dwZyIsIm5hbWUiOiJBbm9ueW1vdXMiLCJzY29wZSI6ImFub255bW91cyIsInByb2plY3RfaWQiOiJ0c3luYy1kM2czdzdqbWFiOTNiOWIyNSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0." +
  "qJJWniHTsDk4Ch3cXGQa0AsBNWbC-UHwBXBrF0u8KanuJAaxyPOtXtnVsbz72-FVQoigc3alWpWf0JNgTM_H2kPBNze3tIrckvmwAyM1zhEOKOKDpdxZIvYT_FNiO3b6sGnGr11AWamjGCcZXK-OiL3clPJZ0oi51FmpJLCJQUczfivHdhTqqJGhJ7LvNEXcpdzRKTMFyVDLnw1hTWz8JvRAiHmRMyTBZ8ljH0xNy9ba2A-RzY9RAo_pK5ko12NiOIbUPMVFLlb2QLIIjvLsiMQC3TRpPOmb7efTMmPpiih4G5KrR3-Y0HQu-V6Zlmoh4fWWFcBfJnbqzuWx8RQbuw";

const app = cloudbase.init({
  env: ENV_ID,
  region: REGION,
  accessKey: ACCESS_KEY,
  auth: { detectSessionInUrl: true },
});

export const auth = app.auth({ persistence: "local" });
export const db = app.database();

// ============================================================
// Auto anonymous sign-in (no login UI)
// ============================================================
let _anonymousSessionReady = false;

export async function ensureAnonymousSession(): Promise<void> {
  if (_anonymousSessionReady) return;
  try {
    const { data: sessionData } = await auth.getSession();
    if (sessionData?.session) {
      _anonymousSessionReady = true;
      return;
    }
  } catch {}

  try {
    const { data, error } = await auth.signInAnonymously();
    if (error) {
      console.warn("[CloudBase] Anonymous sign-in failed:", error.message);
    } else {
      _anonymousSessionReady = true;
      console.log("[CloudBase] Auto anonymous sign-in successful");
    }
  } catch (e: any) {
    console.warn("[CloudBase] Anonymous sign-in error:", e.message);
  }
}

// Auto-init on import
ensureAnonymousSession();

// ============================================================
// Database helpers
// ============================================================

export async function getCollection(collectionName: string): Promise<any[]> {
  await ensureAnonymousSession();
  const res = await db.collection(collectionName).get();
  return res.data || [];
}

export async function addDocument(
  collectionName: string,
  data: Record<string, any>
): Promise<{ id: string }> {
  await ensureAnonymousSession();
  const res = await db.collection(collectionName).add(data);
  return { id: res.id || "" };
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  await ensureAnonymousSession();
  await db.collection(collectionName).doc(docId).update(data);
}

export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  await ensureAnonymousSession();
  await db.collection(collectionName).doc(docId).remove();
}

// ============================================================
// Error handling (kept for compatibility)
// ============================================================

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface CloudbaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: { userId?: string | null };
}

export async function handleCloudbaseError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: CloudbaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path,
  };
  console.error("CloudBase Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default app;