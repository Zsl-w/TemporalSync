/**
 * CloudBase SDK initialization and authentication helpers.
 * Uses Supabase-compatible v2+ API.
 *
 * **CRITICAL**: getLoginState() is DEPRECATED — use getSession() instead.
 * All auth methods return { data, error } pattern. Always check error first.
 *
 * Environment ID should be configured via VITE_CLOUDBASE_ENV_ID in .env.local
 * You can find it at: https://tcb.cloud.tencent.com/dev
 */

import cloudbase from "@cloudbase/js-sdk";

// --- Configuration ---
const ENV_ID =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_CLOUDBASE_ENV_ID) ||
  "";

// Google Client ID (kept for future use)
const GOOGLE_CLIENT_ID =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) ||
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
export const db = app.database();

// ============================================================
// Module-level state for pending OTP verification
// ============================================================

let pendingOtpVerify: {
  verifyOtp: (opts: { token: string }) => Promise<any>;
  email: string;
} | null = null;

// ============================================================
// Auth helpers
// ============================================================

/**
 * Check if current URL contains an OAuth callback (code parameter).
 * Should be called on page load.
 */
export async function handleOAuthCallback(): Promise<any | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return null;

  try {
    await auth.verifyOAuth({ code });
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState({}, "", url.pathname + url.hash);

    const { data: sessionData } = await auth.getSession();
    return sessionData?.session?.user ?? null;
  } catch (e) {
    console.error("[CloudBase] verifyOAuth failed:", e);
    return null;
  }
}

/**
 * Load Google Identity Services script dynamically.
 */
function loadGIS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.id) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

/**
 * Sign in with Google.
 */
export async function signInWithGoogle(): Promise<any> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in .env (from CloudBase console → Identity → Google settings)."
    );
  }

  await loadGIS();

  const credential: string = await new Promise((resolve, reject) => {
    const win = window as any;
    try { win.google?.accounts?.id?.cancel(); } catch {}

    win.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error("No credential in Google response"));
        }
      },
      cancel_on_tap_outside: false,
      auto_select: false,
      context: "signin",
      ux_mode: "popup",
    });

    win.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        reject(new Error(
          "Google sign-in prompt not displayed: " +
          (notification.getNotDisplayedReason?.() || "unknown reason")
        ));
      } else if (notification.isSkippedMoment()) {
        reject(new Error(
          "Google sign-in skipped: " +
          (notification.getSkippedReason?.() || "unknown reason")
        ));
      }
    });
  });

  console.log("[CloudBase] Got Google credential, signing in...");
  await auth.signInWithIdToken({ token: credential });

  const { data: sessionData } = await auth.getSession();
  if (sessionData?.session?.user) return sessionData.session.user;

  try {
    const { data: userData } = await auth.getUser();
    return userData?.user;
  } catch {
    throw new Error("Google 登录后无法获取用户信息");
  }
}

/**
 * Anonymous login via CloudBase.
 * Note: Anonymous login is disabled by default for new environments.
 */
export async function signInAnonymously(): Promise<any> {
  const { data, error } = await auth.signInAnonymously();
  if (error) throw new Error(error.message || "匿名登录失败");

  // Get full user info via getUser
  try {
    const { data: userData } = await auth.getUser();
    if (userData?.user) return userData.user;
  } catch {}

  // Fallback: check session
  const { data: sessionData } = await auth.getSession();
  if (sessionData?.session?.user) return sessionData.session.user;
  if (data?.user) return data.user;

  throw new Error("匿名登录失败 - 无法获取用户信息");
}

/**
 * Email + Password sign in with auto-register for admin emails.
 *
 * Flow:
 * 1. Try signInWithPassword → success = logged in
 * 2. If "not registered" and is admin email → auto signUp → OTP sent
 * 3. Returns { needsVerification: true, email } to trigger OTP verification UI
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<any | { needsVerification: true; email: string }> {
  const adminEmails = ["wangzouszz@gmail.com", "wjunli1007@qq.com"];
  const isAdminEmail = adminEmails.includes(email);

  // Step 1: Try sign in with password
  try {
    const { data, error } = await auth.signInWithPassword({ email, password });

    if (!error && data?.user) {
      return data.user;
    }

    if (error) {
      const errMsg = (error.message || "").toLowerCase();
      if (errMsg.includes("not registered") || errMsg.includes("not found")
        || errMsg.includes("no such") || errMsg.includes("does not exist")) {
        // User not registered — fall through to OTP flow for admin
        if (!isAdminEmail) throw new Error("该邮箱尚未注册，请联系管理员开通权限。");
        return await sendAdminOtp(email);
      }
      // For admin emails, any sign-in failure triggers OTP flow
      // (email OTP signUp doesn't set password, so signInWithPassword always fails)
      if (isAdminEmail) {
        console.log("[CloudBase] signInWithPassword failed for admin, trying OTP flow:", errMsg);
        return await sendAdminOtp(email);
      }
      throw new Error(error.message || "登录失败，请重试。");
    }
  } catch (e: any) {
    // signInWithPassword may throw instead of returning {error}
    const msg = (e?.message || e?.code || "").toLowerCase();
    if (msg.includes("not registered") || msg.includes("not found")
      || msg.includes("no such") || msg.includes("does not exist")) {
      if (!isAdminEmail) throw new Error("该邮箱尚未注册，请联系管理员开通权限。");
      return await sendAdminOtp(email);
    }
    // For admin emails, any sign-in failure triggers OTP flow
    if (isAdminEmail) {
      console.log("[CloudBase] signInWithPassword threw for admin, trying OTP flow:", msg);
      return await sendAdminOtp(email);
    }
    throw e;
  }

  // Unreachable — but if we got here and it's admin, send OTP
  if (isAdminEmail) return await sendAdminOtp(email);
  throw new Error("登录失败，请重试。");
}

/**
 * Send OTP verification code to admin email.
 * If the account doesn't exist yet, creates it via signUp (email OTP, NO password).
 * If already exists, sends a verification code via signInWithOtp.
 */
async function sendAdminOtp(
  email: string
): Promise<{ needsVerification: true; email: string }> {
  console.log("[CloudBase] Sending OTP to admin:", email);

  // Try signInWithOtp first (for existing accounts)
  try {
    const { data, error } = await auth.signInWithOtp({ email } as any);
    if (!error && data?.verifyOtp) {
      pendingOtpVerify = { verifyOtp: data.verifyOtp, email };
      console.log("[CloudBase] OTP code sent via signInWithOtp to", email);
      return { needsVerification: true, email };
    }
  } catch {}

  // Fallback: signUp (creates account if not exists, sends OTP)
  try {
    // NOTE: Email OTP signUp does NOT accept password.
    // The user will be logged in via OTP verification, not via password.
    const { data, error } = await auth.signUp({
      email,
      nickname: email.split("@")[0],
    } as any);

    if (!error && data?.verifyOtp) {
      pendingOtpVerify = { verifyOtp: data.verifyOtp, email };
      console.log("[CloudBase] OTP code sent via signUp to", email);
      return { needsVerification: true, email };
    }

    if (error) {
      const errMsg = (error.message || "").toLowerCase();
      if (errMsg.includes("already") || errMsg.includes("exist")) {
        // Account exists — try sending code
        try { await (auth as any).sendEmailVerificationCode({ email }); } catch {}
        return { needsVerification: true, email };
      }
      throw new Error(error.message || "发送验证码失败");
    }
  } catch (e: any) {
    const msg = (e?.message || "").toLowerCase();
    if (msg.includes("already") || msg.includes("exist")) {
      try { await (auth as any).sendEmailVerificationCode({ email }); } catch {}
      return { needsVerification: true, email };
    }
    throw e;
  }

  return { needsVerification: true, email };
}

/**
 * Verify email OTP and login.
 *
 * After verifyOtp succeeds, CloudBase auto-creates a session —
 * we check getSession() directly instead of trying signInWithPassword
 * (which won't work because email OTP signUp doesn't set a password).
 */
export async function verifyAndSignIn(
  email: string,
  code: string,
  _password: string
): Promise<any> {
  // Step 1: Verify OTP
  if (pendingOtpVerify && pendingOtpVerify.email === email) {
    try {
      await pendingOtpVerify.verifyOtp({ token: code });
      pendingOtpVerify = null;
      console.log("[CloudBase] OTP verified successfully");
    } catch (e: any) {
      pendingOtpVerify = null;
      throw new Error(`验证码错误: ${e.message || "请检查验证码是否正确"}`);
    }
  } else {
    // Fallback: try generic verifyOtp
    try {
      const { error } = await (auth as any).verifyOtp({ email, token: code, type: "email" });
      if (error) throw new Error(error.message || "验证码错误");
    } catch (e: any) {
      throw new Error(`验证码错误: ${e.message || "请检查验证码是否正确"}`);
    }
  }

  // Step 2: verifyOtp auto-creates a session — check it directly
  const { data: sessionData } = await auth.getSession();
  if (sessionData?.session?.user) {
    console.log("[CloudBase] User logged in via OTP session");
    return sessionData.session.user;
  }

  // Step 3: Fallback — try getUser
  try {
    const { data: userData } = await auth.getUser();
    if (userData?.user) return userData.user;
  } catch {}

  throw new Error("验证后登录失败，请重试。");
}

/**
 * Sign out current user.
 */
export async function signOut(): Promise<void> {
  await auth.signOut();
}

/**
 * Get current user using getSession() — NOT the deprecated getLoginState().
 *
 * getLoginState() is DEPRECATED and returns misleading data (uid) even
 * without real login when accessKey is configured.
 *
 * getSession() returns { data: { session } } where data.session is
 * undefined when no real login has occurred — this is the ONLY reliable
 * way to check auth state.
 */
export async function getCurrentUser(): Promise<any | null> {
  try {
    // Primary: use getSession() — the reliable auth check
    const { data: sessionData } = await auth.getSession();
    if (sessionData?.session?.user) {
      return sessionData.session.user;
    }

    // Fallback: try getUser()
    const { data: userData } = await auth.getUser();
    if (userData?.user) {
      return userData.user;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Listen to auth state changes using onAuthStateChange.
 * Replaces deprecated onLoginStateChanged.
 *
 * Callback receives the User object (not loginState wrapper).
 * Returns an unsubscribe function.
 */
export function onAuthStateChanged(
  callback: (user: any | null) => void
): () => void {
  let unsubscribe: (() => void) | null = null;

  try {
    // Use onAuthStateChange (v2+ Supabase-compatible API)
    const result = auth.onAuthStateChange((_event: string, session: any) => {
      if (session?.user) {
        callback(session.user);
      } else {
        callback(null);
      }
    });

    // Extract subscription from result
    if (result?.data?.subscription?.unsubscribe) {
      const sub = result.data.subscription;
      unsubscribe = () => sub.unsubscribe();
    }
  } catch (e) {
    console.warn("[CloudBase] onAuthStateChange failed, trying fallback:", e);
  }

  // Fallback to old API if onAuthStateChange not available
  if (!unsubscribe) {
    try {
      const ref = auth.onLoginStateChanged((loginState: any) => {
        callback(loginState?.user ?? null);
      });
      if (typeof ref === "function") {
        unsubscribe = ref;
      } else if (ref?.unsubscribe) {
        unsubscribe = () => ref.unsubscribe();
      } else if (ref?.off) {
        unsubscribe = () => ref.off();
      }
    } catch (e2) {
      console.warn("[CloudBase] onLoginStateChanged also failed:", e2);
    }
  }

  return () => {
    try { unsubscribe?.(); } catch {}
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
      userId: user?.id || user?.uid || null,
      email: user?.email || null,
      isAnonymous: user?.is_anonymous || user?.loginType === "ANONYMOUS" || false,
    },
    operationType,
    path,
  };
  console.error("CloudBase Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default app;
