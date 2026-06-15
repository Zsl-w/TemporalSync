/**
 * CloudBase API reverse proxy.
 *
 * Forwards all requests to CloudBase gateway, bypassing CORS restrictions
 * that occur when the front-end domain is not in CloudBase's allowlist
 * (free tier limitation).
 *
 * Route: /tcb-proxy/*
 * Target: https://{envId}.api.tcloudbasegateway.com/*
 */

const TARGET_BASE = "https://tsync-d3g3w7jmab93b9b25.api.tcloudbasegateway.com";

export async function onRequest(context: {
  request: Request;
  env: Record<string, string>;
  params: Record<string, string[]>;
}) {
  const { request, params } = context;

  // Extract the remaining path from the catch-all param
  // params.default is an array of path segments
  const routePath = params.default?.join("/") ?? "";
  const targetUrl = `${TARGET_BASE}/${routePath}`;

  // Forward query string
  const url = new URL(request.url);
  const queryString = url.search;
  const fullTarget = `${targetUrl}${queryString}`;

  try {
    // Build forwarded request with original headers
    const headers = new Headers(request.headers);

    // Remove hop-by-hop headers to avoid issues
    headers.delete("host");
    headers.delete("origin");
    headers.delete("referer");

    const proxyRequest = new Request(fullTarget, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD"
        ? await request.clone().arrayBuffer()
        : undefined,
    });

    const proxyResponse = await fetch(proxyRequest);

    // Build response with CORS headers
    const responseHeaders = new Headers(proxyResponse.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    responseHeaders.set("Access-Control-Allow-Headers", "*");
    responseHeaders.delete("set-cookie"); // cookies not needed for auth API

    return new Response(proxyResponse.body, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: responseHeaders,
    });
  } catch (e: any) {
    console.error("[TCB Proxy] Error forwarding request:", e.message);
    return new Response(
      JSON.stringify({ error: "Proxy error", detail: e.message }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
