import { useState, useEffect, type FormEvent } from 'react';
import { useRealtimeKitClient } from '@cloudflare/realtimekit-react';
import {
  RtkChat,
  RtkDialogManager,
  RtkUiProvider,
  provideRtkDesignSystem,
} from '@cloudflare/realtimekit-react-ui';
import { 
  Hash, 
  MessageSquare, 
  Settings, 
  Users, 
  LogOut, 
  Shield 
} from 'react-feather';

// --- Sub-components to enforce structural modularity ---

function SessionAuthenticationView({ onTokenSubmit }: { onTokenSubmit: (token: string) => void }) {
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAuthenticationSubmission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokenInput.trim()) return;
    
    setIsSubmitting(true);
    // Simulate slight network delay for UI feedback before passing control to RTK
    setTimeout(() => {
      onTokenSubmit(tokenInput.trim());
    }, 400);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4 font-sans text-neutral-200">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-cf-orange/10 rounded-xl">
              <Shield className="w-8 h-8 text-cf-orange" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2">Secure Gateway</h2>
          <p className="text-center text-neutral-400 mb-8 text-sm">
            Enter your cryptographically signed authorization token to access the real-time edge network.
          </p>

          <form onSubmit={handleAuthenticationSubmission} className="space-y-6">
            <div>
              <label htmlFor="authToken" className="block text-sm font-medium text-neutral-300 mb-2">
                Authorization Token
              </label>
              <input
                id="authToken"
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ey..."
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cf-orange focus:border-transparent transition-all font-mono text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !tokenInput.trim()}
              className="w-full bg-cf-orange hover:bg-[#d9701a] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Initialize Connection"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ApplicationSidebar() {
  return (
    <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-neutral-800">
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cf-orange" />
          EdgeNet Comms
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-6">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
            Active Channels
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-2 py-2 bg-neutral-900 text-white rounded-md transition-colors">
              <Hash className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-medium">general-relay</span>
            </button>
            <button className="w-full flex items-center gap-3 px-2 py-2 text-neutral-400 hover:bg-neutral-900/50 hover:text-white rounded-md transition-colors">
              <Hash className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium">system-alerts</span>
            </button>
          </div>
        </div>

        <div className="px-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
            Direct Connections
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-2 py-2 text-neutral-400 hover:bg-neutral-900/50 hover:text-white rounded-md transition-colors">
              <div className="relative">
                <Users className="w-4 h-4 text-neutral-500" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-neutral-950"></div>
              </div>
              <span className="text-sm font-medium">Architecture Team</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center justify-between text-neutral-400 hover:text-white transition-colors cursor-pointer px-2 py-2 rounded-md hover:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Preferences</span>
          </div>
        </div>
        <div 
          className="flex items-center justify-between text-neutral-400 hover:text-red-400 transition-colors cursor-pointer px-2 py-2 rounded-md hover:bg-neutral-900/50 mt-1"
          onClick={() => window.location.href = '/'}
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Disconnect</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// --- Main Application Controller ---

export function App() {
  const [activeMeetingInstance, initializeRealtimeMeeting] = useRealtimeKitClient();
  const [requiresManualToken, setRequiresManualToken] = useState<boolean>(false);
  const [connectionPhase, setConnectionPhase] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  useEffect(() => {
    // Inject Cloudflare RTK Design System variables globally
    provideRtkDesignSystem(document.body, {
      theme: 'dark', // Aligning with professional dark mode layout
    });

    const browserUrlParams = new URL(window.location.href).searchParams;
    const extractedAuthToken = browserUrlParams.get('authToken');

    if (!extractedAuthToken) {
      setRequiresManualToken(true);
      return;
    }

    executeMeetingInitialization(extractedAuthToken);
  }, [initializeRealtimeMeeting]);

  const executeMeetingInitialization = (validToken: string) => {
    setConnectionPhase('connecting');
    setRequiresManualToken(false);

    // If token wasn't in URL, seamlessly update the history state for refresh survival
    const currentUrl = new URL(window.location.href);
    if (!currentUrl.searchParams.has('authToken')) {
      currentUrl.searchParams.set('authToken', validToken);
      window.history.replaceState({}, '', currentUrl.toString());
    }

    initializeRealtimeMeeting({
      authToken: validToken,
      defaults: {
        video: false,
        audio: false,
      },
    })
      .then((establishedMeeting) => {
        Object.assign(window, { activeRealtimeMeeting: establishedMeeting });
        setConnectionPhase('connected');
      })
      .catch((initializationError) => {
        console.error("Failed to establish RTK connection:", initializationError);
        setConnectionPhase('error');
        setRequiresManualToken(true);
      });
  };

  // 1. Render Authentication Gate if token is missing or invalid
  if (requiresManualToken && connectionPhase !== 'connecting') {
    return <SessionAuthenticationView onTokenSubmit={executeMeetingInitialization} />;
  }

  // 2. Render Loading State during WebSocket negotiation
  if (!activeMeetingInstance || connectionPhase === 'connecting') {
    return (
      <div className="h-screen w-full bg-neutral-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-cf-orange/20 border-t-cf-orange rounded-full animate-spin"></div>
        <p className="text-neutral-400 font-mono text-sm animate-pulse">Establishing secure edge connection...</p>
      </div>
    );
  }

  // 3. Render the Professional Shell encompassing the RealtimeKit layout
  return (
    <div className="h-screen w-full bg-neutral-900 flex overflow-hidden font-sans text-neutral-200">
      <ApplicationSidebar />
      
      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-16 border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm flex items-center px-6 justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-white">general-relay</h2>
            <span className="text-xs font-medium px-2 py-1 bg-neutral-800 text-neutral-400 rounded-md">
              Global Zone
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </div>
          </div>
        </header>

        {/* RealtimeKit Context Provider and Core Components */}
        <section className="flex-1 overflow-hidden relative bg-[#0a0a0a]">
          <RtkUiProvider meeting={activeMeetingInstance}>
            {/* The RTK Chat will automatically expand to fill this flex container */}
            <div className="absolute inset-0 flex flex-col [&>div]:flex-1">
              <RtkChat />
            </div>
            <RtkDialogManager />
          </RtkUiProvider>
        </section>
      </main>
    </div>
  );
}

export default App;
