import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { UserSessionDurableObject } from "./UserSessionDurableObject";
import type { ApiResponse, UserSessionData } from "../shared/types";

export interface Env {
  USER_SESSION_DO: DurableObjectNamespace<UserSessionDurableObject>;
}

// Durable Objects must be exported from the root entrypoint
export { UserSessionDurableObject };

export default {
  async fetch(incomingRequest: Request, environmentBoundaries: Env, executionContext: ExecutionContext): Promise<Response> {
    const requestUrlDefinition = new URL(incomingRequest.url);

    if (requestUrlDefinition.pathname.startsWith("/api/")) {
      return executeApiRouting(incomingRequest, requestUrlDefinition, environmentBoundaries);
    }

    return new Response(JSON.stringify({ success: false, error: "Edge Route Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
};

async function executeApiRouting(activeRequest: Request, parsedUrl: URL, environment: Env): Promise<Response> {
  if (parsedUrl.pathname === "/api/session" && activeRequest.method === "GET") {
    
    // 1. Utilize native C++ Node bindings for deterministic hashing in the isolate
    const rawSessionIdentifier = "global-demo-session-v2";
    const sessionBufferData = Buffer.from(rawSessionIdentifier);
    const deterministicHashHex = createHash("sha256").update(sessionBufferData).digest("hex");
    
    // Truncate the hash to create a clean, 16-character deterministic ID
    const finalizedSessionId = deterministicHashHex.substring(0, 16);

    // 2. Instantiate and communicate with the Durable Object via native RPC
    const durableObjectId = environment.USER_SESSION_DO.idFromName(finalizedSessionId);
    const durableObjectStub = environment.USER_SESSION_DO.get(durableObjectId);
    
    const incrementedVisitCount = await durableObjectStub.incrementVisitCount();
    
    const edgeResponsePayload: ApiResponse<UserSessionData> = {
      success: true,
      data: {
        sessionId: finalizedSessionId,
        visitCount: incrementedVisitCount
      }
    };

    return new Response(JSON.stringify(edgeResponsePayload), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store" 
      }
    });
  }

  return new Response(JSON.stringify({ success: false, error: "Method not allowed or endpoint constraint failed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
}
