import { useState, useEffect } from "react";
import type { ApiResponse, UserSessionData } from "../shared/types";

export function App() {
  const [userSessionState, setUserSessionState] = useState<UserSessionData | null>(null);
  const [isNetworkRequestPending, setIsNetworkRequestPending] = useState<boolean>(true);
  const [fetchOperationErrorMessage, setFetchOperationErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function executeSessionFetch(): Promise<void> {
      try {
        const networkResponse = await fetch("/api/session");
        
        if (!networkResponse.ok) {
          throw new Error(`Edge rejected request with HTTP status ${networkResponse.status}`);
        }
        
        const parsedResult: ApiResponse<UserSessionData> = await networkResponse.json();
        
        if (parsedResult.success && parsedResult.data) {
          setUserSessionState(parsedResult.data);
        } else {
          setFetchOperationErrorMessage(parsedResult.error || "Data constraint failure enforced by Edge");
        }
      } catch (capturedError) {
        setFetchOperationErrorMessage(capturedError instanceof Error ? capturedError.message : String(capturedError));
      } finally {
        setIsNetworkRequestPending(false);
      }
    }

    executeSessionFetch();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Edge React Architecture</h1>
          <p className="text-neutral-400 text-lg">
            Powered by native workerd, Vite Environment API, Node.js Compat, and Durable Objects.
          </p>
        </header>
        
        <main className="p-6 border border-neutral-800 bg-neutral-900 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-cf-orange">Distributed State Manifest</h2>
          
          {isNetworkRequestPending && (
            <div className="flex items-center space-x-3 text-neutral-400 animate-pulse">
              <div className="w-4 h-4 rounded-full bg-cf-orange"></div>
              <p>Establishing native RPC connection to Durable Object...</p>
            </div>
          )}
          
          {fetchOperationErrorMessage && (
            <div className="p-4 bg-red-950/50 border border-red-900 rounded-lg text-red-400 font-mono text-sm">
              Fault Detected: {fetchOperationErrorMessage}
            </div>
          )}
          
          {userSessionState && (
            <ul className="space-y-3 font-mono text-sm bg-black/50 p-4 rounded-lg border border-neutral-800">
              <li className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-500">Idempotency Key</span>
                <span className="text-emerald-400 font-bold">{userSessionState.sessionId}</span>
              </li>
              <li className="flex justify-between pt-1">
                <span className="text-neutral-500">Global Operation Count</span>
                <span className="text-blue-400 font-bold">{userSessionState.visitCount}</span>
              </li>
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
