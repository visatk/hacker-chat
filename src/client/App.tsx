import { useState, useEffect, type FormEvent, useCallback } from 'react';
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
  Shield,
  Menu,
  X,
  Copy,
  Check,
  Radio
} from 'react-feather';

// --- Structural Sub-components ---

function SessionAuthenticationView({ onTokenSubmit }: { onTokenSubmit: (token: string) => void }) {
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAuthenticationSubmission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokenInput.trim()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      onTokenSubmit(tokenInput.trim());
    }, 600);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-neutral-200">
      <div className="max-w-md w-full bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cf-orange/10 rounded-2xl border border-cf-orange/20 shadow-[0_0_15px_rgba(243,128,32,0.15)]">
              <Shield className="w-8 h-8 text-cf-orange" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">Secure Gateway</h2>
          <p className="text-center text-neutral-400 mb-8 text-sm leading-relaxed">
            Enter your cryptographically signed authorization token to access the real-time edge network.
          </p>

          <form onSubmit={handleAuthenticationSubmission} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="authToken" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Authorization Token
              </label>
              <input
                id="authToken"
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ey..."
                className="w-full bg-neutral-950/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cf-orange/50 focus:border-cf-orange transition-all font-mono text-sm placeholder:text-neutral-600 shadow-inner"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !tokenInput.trim()}
              className="w-full bg-gradient-to-r from-cf-orange to-[#d9701a] hover:from-[#e0751b] hover:to-[#c66517] text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-cf-orange/20 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeChannel: string;
  setActiveChannel: (channel: string) => void;
}

function ApplicationSidebar({ isOpen, onClose, activeChannel, setActiveChannel }: SidebarProps) {
  const channels = ['general-relay', 'system-alerts', 'edge-architecture'];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:relative inset-y-0 left-0 z-50 w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col h-full transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-800 shrink-0">
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-cf-orange" />
            EdgeNet Comms
          </h1>
          <button className="md:hidden text-neutral-400 hover:text-white" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-neutral-800">
          <div className="px-4 mb-8">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
              <span>Active Channels</span>
              <span className="bg-neutral-800 text-neutral-300 py-0.5 px-2 rounded-full text-[10px]">{channels.length}</span>
            </h3>
            <div className="space-y-1">
              {channels.map((channel) => (
                <button 
                  key={channel}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeChannel === channel 
                      ? 'bg-neutral-800/80 text-white shadow-sm border border-neutral-700/50' 
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Hash className={`w-4 h-4 ${activeChannel === channel ? 'text-cf-orange' : 'text-neutral-500'}`} />
                  <span className="text-sm font-medium truncate">{channel}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-4">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
              Direct Connections
            </h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-neutral-400 hover:bg-neutral-900 hover:text-white rounded-lg transition-colors">
                <div className="relative">
                  <Users className="w-4 h-4 text-neutral-500" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-950"></div>
                </div>
                <span className="text-sm font-medium">Architecture Team</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-neutral-800 bg-neutral-950/50 shrink-0">
          <div className="flex items-center justify-between text-neutral-400 hover:text-white transition-colors cursor-pointer px-3 py-2.5 rounded-lg hover:bg-neutral-900">
            <div className="flex items-center gap-3">
              <Settings className="w-4.5 h-4.5" />
              <span className="text-sm font-medium">Preferences</span>
            </div>
          </div>
          <div 
            className="flex items-center justify-between text-neutral-400 hover:text-red-400 transition-colors cursor-pointer px-3 py-2.5 rounded-lg hover:bg-neutral-900/80 mt-1"
            onClick={() => window.location.href = '/'}
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4.5 h-4.5" />
              <span className="text-sm font-medium">Disconnect Node</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// --- Main Application Controller ---

export function App() {
  const [activeMeetingInstance, initializeRealtimeMeeting] = useRealtimeKitClient();
  const [requiresManualToken, setRequiresManualToken] = useState<boolean>(false);
  const [connectionPhase, setConnectionPhase] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeChannel, setActiveChannel] = useState<string>('general-relay');
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  useEffect(() => {
    provideRtkDesignSystem(document.body, {
      theme: 'dark',
    });

    const browserUrlParams = new URL(window.location.href).searchParams;
    const extractedAuthToken = browserUrlParams.get('authToken');

    if (!extractedAuthToken) {
      setRequiresManualToken(true);
      return;
    }

    executeMeetingInitialization(extractedAuthToken);
  }, [initializeRealtimeMeeting]);

  const executeMeetingInitialization = useCallback((validToken: string) => {
    setConnectionPhase('connecting');
    setRequiresManualToken(false);

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
        console.error("RTK Connection Fault:", initializationError);
        setConnectionPhase('error');
        setRequiresManualToken(true);
      });
  }, [initializeRealtimeMeeting]);

  const copyInviteUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  if (requiresManualToken && connectionPhase !== 'connecting') {
    return <SessionAuthenticationView onTokenSubmit={executeMeetingInitialization} />;
  }

  if (!activeMeetingInstance || connectionPhase === 'connecting') {
    return (
      <div className="h-screen w-full bg-neutral-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-neutral-800 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-cf-orange border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <Shield className="w-4 h-4 text-cf-orange absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="flex flex-col items-center space-y-1">
          <p className="text-white font-medium">Negotiating Edge Websocket</p>
          <p className="text-neutral-500 font-mono text-xs">Securing TLS channel to global dispatcher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-neutral-900 flex overflow-hidden font-sans text-neutral-200 selection:bg-cf-orange/30">
      <ApplicationSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeChannel={activeChannel}
        setActiveChannel={(channel) => {
          setActiveChannel(channel);
          setIsSidebarOpen(false); // Auto-close on mobile selection
        }}
      />
      
      <main className="flex-1 flex flex-col relative min-w-0 h-full">
        {/* Responsive Header */}
        <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex items-center px-4 sm:px-6 justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-1.5 -ml-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <Hash className="w-5 h-5 text-neutral-500 hidden sm:block" />
            <h2 className="text-base sm:text-lg font-semibold text-white truncate max-w-[150px] sm:max-w-xs">
              {activeChannel}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 text-sm font-medium">
            <button 
              onClick={copyInviteUrl}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md transition-colors text-xs font-mono border border-neutral-700"
              title="Copy Session Link"
            >
              {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {linkCopied ? "Copied!" : "Invite Link"}
            </button>
            
            {/* Mobile simplified share button */}
            <button 
              onClick={copyInviteUrl}
              className="sm:hidden p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-md"
            >
               {linkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline-block">Connected</span>
            </div>
          </div>
        </header>

        {/* RealtimeKit Subsystem */}
        <section className="flex-1 overflow-hidden relative bg-[#0a0a0a]">
          <RtkUiProvider meeting={activeMeetingInstance}>
            {/* The RTK Chat structure expands into this absolute flex container */}
            <div className="absolute inset-0 flex flex-col [&>div]:flex-1 pb-safe">
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
