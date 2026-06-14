/**
 * CloudBase SDK initialization and authentication helpers.
 * Replaces the old firebase.ts module.
 *
 * Environment ID should be configured via VITE_CLOUDBASE_ENV_ID in .env.local
 * You can find it at: https://tcb.cloud.tencent.com/dev
 */

import cloudbase from "@cloudbase/js-sdk";

// --- Configuration ---
// IMPORTANT: Create a .env.local file with:
//   VITE_CLOUDBASE_ENV_ID=your-cloudbase-env-id
// Or replace the fallback below with your actual environment ID.
const ENV_ID =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_CLOUDBASE_ENV_ID) ||
  "";

if (!ENV_ID) {
  console.warn("[CloudBase] VITE_CLOUDBASE_ENV_ID is not set. Auth and database features will be disabled.");
}

// --- CloudBase App Instance ---
const app = cloudbase.init({
  env: ENV_ID || "__placeholder__",
});

// --- Auth instance ---
export const auth = app.auth({ persistence: "local" });

// --- Database instance ---

// ============================================================
// Auth helpers
// ============================================================

/**
 * Check if current URL contains an OAuth callback (code parameter).
 * If so, verify the OAuth callback to complete login.
 * Should be called on page load.
 */
export async function handleOAuthCallback(): Promise<any | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return null;

  try {
    await auth.verifyOAuth({ code });
    // Clean up URL
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState({}, "", url.pathname + url.hash);
    // Get the user from login state
    const loginState = await auth.getLoginState();
    return loginState?.user ?? null;
  } catch (e) {
    console.error("[CloudBase] verifyOAuth failed:", e);
    return null;
  }
}

/**
 * Sign in with Google OAuth.
 * signInWithOAuth redirects to Google's login page.
 * After Google auth, user is redirected back with a ?code= parameter.
 * The code is then verified by handleOAuthCallback() on page load.
 * Requires: CloudBase console → Identity → Login Methods → Google enabled.
 */
export async function signInWithGoogle(): Promise<void> {
  await auth.signInWithOAuth({ provider: "google" });
  // This will redirect the browser away, so code after this won't execute.
  // The login is completed when the user returns via handleOAuthCallback().
}

/**
 * Anonymous login via CloudBase.
 * Requires: CloudBase console → Identity → Login Methods → Anonymous enabled.
 */
export async function signInAnonymously(): Promise<any> {
  await auth.signInAnonymously();
  // signInAnonymously creates the session but getLoginState returns the user
  const loginState = await auth.getLoginState();
  if (loginState) {
    // Try getUser for more details, fall back to loginState
    try {
      const user = await auth.getUser();
      return user;
    } catch {
      return loginState;
    }
  }
  throw new Error("Anonymous login failed - no user returned.");
}

/**
 * Email + Password sign up.
 * CloudBase uses signInWithPassword for both sign-up and sign-in with email.
 * Requires: CloudBase console → Identity → Login Methods → Email enabled.
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<any> {
  await auth.signUp({ email, password });
  const loginState = await auth.getLoginState();
  if (loginState) {
    try {
      return await auth.getUser();
    } catch {
      return loginState;
    }
  }
  throw new Error("Email sign up failed - no user returned.");
}

/**
 * Email + Password sign in.
 * CloudBase uses signInWithPassword({ email, password }).
 * Requires: CloudBase console → Identity → Login Methods → Email enabled.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<any> {
  await auth.signInWithPassword({ email, password });
  const loginState = await auth.getLoginState();
  if (loginState) {
    try {
      return await auth.getUser();
    } catch {
      return loginState;
    }
  }
  throw new Error("Email login failed - no user returned.");
}

/**
 * Sign out current user.
 */
export async function signOut(): Promise<void> {
  await auth.signOut();
}

/**
 * Get current login state (user object or null).
 */
export async function getCurrentUser(): Promise<any | null> {
  const loginState = await auth.getLoginState();
  return loginState?.user ?? null;
}

/**
 * Listen to auth state changes.
 * Returns an unsubscribe function.
 * CloudBase's onLoginStateChanged may not return an unsubscribe function,
 * so we wrap it safely.
 */
export function onAuthStateChanged(
  callback: (user: any | null) => void
): () => void {
  let handlerRef: any = null;
  try {
    handlerRef = auth.onLoginStateChanged((loginState: any) => {
      callback(loginState?.user ?? null);
    });
  } catch (e) {
    console.warn("[CloudBase] onLoginStateChanged failed:", e);
  }
  // Return a safe unsubscribe - handle both Firebase-style and CloudBase-style returns
  return () => {
    try {
      if (typeof handlerRef === "function") {
        handlerRef();
      } else if (handlerRef && typeof handlerRef.unsubscribe === "function") {
        handlerRef.unsubscribe();
      } else if (handlerRef && typeof handlerRef.off === "function") {
        handlerRef.off();
      } else if (handlerRef && typeof handlerRef.remove === "function") {
        handlerRef.remove();
      }
    } catch {
      // Silently ignore - the cancelled flag in AuthContext handles cleanup
    }
  };
}

// ============================================================
// Database helpers (CloudBase document database)
// ============================================================

/**
 * Get all documents from a collection.
 */
export async function getCollection(collectionName: string): Promise<any[]> {
  const res = await db.collection(collectionName).get();
  return res.data || [];
}

/**
 * Add a document to a collection.
 */
export async function addDocument(
  collectionName: string,
  data: Record<string, any>
): Promise<{ id: string }> {
  const res = await db.collection(collectionName).add(data);
  return { id: res.id || "" };
}

/**
 * Update a document in a collection.
 */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  await db.collection(collectionName).doc(docId).update(data);
}

/**
 * Delete a document from a collection.
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  await db.collection(collectionName).doc(docId).remove();
}

// ============================================================
// Error handling
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
  authInfo: {
    userId?: string | null;
    email?: string | null;
    isAnonymous?: boolean | null;
  };
}

export async function handleCloudbaseError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const user = await getCurrentUser();
  const errInfo: CloudbaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid ?? null,
      email: user?.email ?? null,
      isAnonymous: user?.loginType === "ANONYMOUS" ?? null,
    },
    operationType,
    path,
  };
  console.error("CloudBase Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default app;
