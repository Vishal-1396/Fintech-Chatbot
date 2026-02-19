
import React, { useState, useRef, useEffect } from 'react';
import { Sender, Message, FileData, Source } from './types';
import { generateFintechResponse } from './geminiService';
import { FALLBACK_MESSAGE } from './constants';
import Login from './Login';
import { 
  PaperClipIcon, 
  PaperAirplaneIcon, 
  DocumentIcon,
  XMarkIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  LinkIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  ArrowsPointingOutIcon,
  ScaleIcon,
  PresentationChartLineIcon,
  ClockIcon,
  ShieldCheckIcon,
  BoltIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

// Extend window interface for AI Studio global methods
// Fixed: Explicitly declare the AIStudio interface and use the 'readonly' modifier for 'window.aistudio' to match existing global definitions.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    readonly aistudio: AIStudio;
  }
}

const MarketTicker = () => {
  const [prices, setPrices] = useState([
    { name: 'S&P 500', val: 5137.08, change: 0.82 },
    { name: 'NASDAQ', val: 16274.94, change: 1.14 },
    { name: 'BTC/USD', val: 67432.50, change: -2.10 },
    { name: 'ETH/USD', val: 3412.12, change: -1.45 },
    { name: 'GOLD', val: 2114.10, change: 0.45 },
    { name: 'US 10Y', val: 4.21, change: -0.02 },
    { name: 'EUR/USD', val: 1.0852, change: 0.12 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => ({
        ...p,
        val: p.val + (Math.random() - 0.5) * (p.val * 0.0005)
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 text-slate-300 py-1.5 overflow-hidden whitespace-nowrap border-b border-slate-800 select-none font-mono text-[10px]">
      <div className="flex animate-marquee space-x-12 px-4">
        {[...prices, ...prices].map((s, i) => (
          <div key={i} className="inline-flex items-center space-x-3">
            <span className="text-slate-500 font-bold">{s.name}</span>
            <span className="text-white tabular-nums">{s.val.toLocaleString(undefined, { minimumFractionDigits: s.name.includes('/') ? 4 : 2, maximumFractionDigits: s.name.includes('/') ? 4 : 2 })}</span>
            <span className={s.change >= 0 ? 'text-emerald-400' : 'text-rose-500'}>
              {s.change >= 0 ? '▲' : '▼'} {Math.abs(s.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
      `}</style>
    </div>
  );
};

const FinancialChart: React.FC<{ data: any }> = ({ data }) => {
  if (!data || !data.data || !Array.isArray(data.data)) return null;

  const renderPie = () => {
    const total = data.data.reduce((acc: number, curr: any) => acc + (curr.value || 0), 0);
    let currentAngle = 0;
    return (
      <div className="flex items-center space-x-8">
        <svg width="100" height="100" viewBox="0 0 32 32" className="transform -rotate-90">
          {data.data.map((item: any, i: number) => {
            const slice = ((item.value || 0) / total) * 100;
            const strokeDasharray = `${slice} ${100 - slice}`;
            const offset = 100 - currentAngle;
            currentAngle += slice;
            return (
              <circle key={i} r="16" cx="16" cy="16" fill="transparent" stroke={item.color || '#3b82f6'} strokeWidth="32" strokeDasharray={strokeDasharray} strokeDashoffset={offset} />
            );
          })}
          <circle r="10" cx="16" cy="16" fill="#0f172a" />
        </svg>
        <div className="grid grid-cols-1 gap-2 flex-1">
          {data.data.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-slate-400">{item.label}</span>
              </div>
              <span className="text-[11px] font-bold text-white tabular-nums">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBar = () => {
    const max = Math.max(...data.data.map((d: any) => d.value));
    return (
      <div className="space-y-3">
        {data.data.map((item: any, i: number) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400 uppercase font-bold">{item.label}</span>
              <span className="text-white font-mono">{item.value}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLine = () => {
    const values = data.data.map((d: any) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    const points = data.data.map((d: any, i: number) => {
      const x = (i / (data.data.length - 1)) * 100;
      const y = 100 - ((d.value - min) / (range || 1)) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="h-40 w-full relative">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={data.data[0]?.color || '#3b82f6'}
            strokeWidth="2"
            points={points}
            className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          />
        </svg>
        <div className="flex justify-between mt-2 text-[9px] text-slate-500 uppercase font-bold">
          <span>{data.data[0]?.label}</span>
          <span>{data.data[data.data.length - 1]?.label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="my-6 p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
          <PresentationChartLineIcon className="w-4 h-4 mr-2 text-blue-500" />
          {data.title || 'Market Analytics'}
        </h4>
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
        </div>
      </div>
      {data.type === 'pie' ? renderPie() : data.type === 'line' ? renderLine() : renderBar()}
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('fintech_auth') === 'true');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [lastContext, setLastContext] = useState<{ prompt: string; files: FileData[] } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if (isAuthenticated) scrollToBottom(); }, [messages, isAuthenticated, isLoading]);

  const handleSendMessage = async (textOverride?: string, filesOverride?: FileData[], allowFallback: boolean = false) => {
    const prompt = textOverride || inputText;
    const currentFiles = filesOverride || files;
    
    if (!prompt.trim() && currentFiles.length === 0) return;

    if (!allowFallback) {
      setLastContext({ prompt, files: currentFiles });
      const userMsg: Message = { 
        id: Date.now().toString(), 
        sender: Sender.USER, 
        text: prompt, 
        timestamp: Date.now(), 
        files: currentFiles 
      };
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setFiles([]);
    }

    setIsLoading(true);

    try {
      const { text, sources } = await generateFintechResponse(prompt, messages.slice(-5), currentFiles, allowFallback);
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: Sender.AI, 
        text, 
        timestamp: Date.now(),
        sources 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMessage = err?.message || "";
      const isKeyError = errorMessage.toLowerCase().includes("api key not valid") || 
                         errorMessage.toLowerCase().includes("unauthorized");

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: Sender.AI,
        text: isKeyError 
          ? "TERMINAL_ERROR: Your API key is invalid or unauthorized. Please use the 'Select API Key' button in the header to configure a valid paid GCP project key."
          : `TERMINAL_ERROR: Connection node timed out. ${err?.message || "Verify your API configuration."}`,
        timestamp: Date.now()
      }]);
      
      if (isKeyError) setHasApiKey(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallbackChoice = (choice: 'yes' | 'no') => {
    if (choice === 'no') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: Sender.AI,
        text: "STRICT_MODE_ACTIVE: Response limited to localized document context.",
        timestamp: Date.now()
      }]);
    } else if (lastContext) {
      handleSendMessage(lastContext.prompt, lastContext.files, true);
    }
  };

  const parseMessage = (msg: Message) => {
    const text = msg.text;
    
    // Check for special key selection prompt in the AI text
    if (text.includes("Select API Key")) {
        return (
            <div className="space-y-4">
                <p className="whitespace-pre-wrap leading-relaxed opacity-90">{text}</p>
                <button 
                  onClick={handleSelectKey}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg"
                >
                    <KeyIcon className="w-4 h-4" />
                    <span>Configure Secure Key</span>
                </button>
            </div>
        );
    }

    if (text === FALLBACK_MESSAGE) {
      return (
        <div className="space-y-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
          <div className="flex items-start space-x-3 text-blue-300">
            <ExclamationCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-[13px] font-medium leading-relaxed">{text}</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => handleFallbackChoice('yes')}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
            >
              Extend Search (Web)
            </button>
            <button 
              onClick={() => handleFallbackChoice('no')}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (text.startsWith("DOMAIN_ERROR:")) {
      return (
        <div className="flex items-center space-x-3 text-rose-400 bg-rose-950/30 p-4 border border-rose-500/30 rounded-xl">
          <ScaleIcon className="w-5 h-5" />
          <span className="text-[13px] font-bold tracking-tight">{text}</span>
        </div>
      );
    }

    const parts = text.split(/(\[CHART_DATA: [\s\S]*?\])/g);
    const confidenceMatch = text.match(/Confidence: (High|Medium|Low)/i);
    const cleanParts = parts.map(p => p.replace(/Confidence: (High|Medium|Low)/i, ''));

    return (
      <div className="space-y-4">
        {cleanParts.map((part, i) => {
          if (part.startsWith('[CHART_DATA:')) {
            const jsonStr = part.match(/\[CHART_DATA: ([\s\S]*?)\]/)?.[1];
            if (jsonStr) {
              try {
                const data = JSON.parse(jsonStr);
                return <FinancialChart key={i} data={data} />;
              } catch (e) {
                return null;
              }
            }
          }
          return <p key={i} className="whitespace-pre-wrap leading-relaxed opacity-90">{part}</p>;
        })}

        {msg.sources && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center">
              <GlobeAltIcon className="w-3 h-3 mr-2" /> Web Verified Sources
            </div>
            <div className="flex flex-wrap gap-2">
              {msg.sources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" 
                   className="text-[10px] text-blue-400 hover:text-white flex items-center bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
                  <LinkIcon className="w-3 h-3 mr-2" /> {s.title.length > 30 ? s.title.substring(0, 30) + '...' : s.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {confidenceMatch && (
          <div className="flex justify-end pt-2">
            <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
              confidenceMatch[1] === 'High' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : 'text-amber-400 border-amber-500/30 bg-amber-500/5'
            }`}>
              <CheckBadgeIcon className="w-3 h-3 mr-2" /> {confidenceMatch[0]}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) return <Login onLogin={() => { setIsAuthenticated(true); localStorage.setItem('fintech_auth', 'true'); }} />;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <MarketTicker />
      
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center z-30 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black leading-none tracking-tight text-white uppercase italic">FinTech AI Chatbot</h1>
            <div className="flex items-center mt-1.5">
              <div className="flex space-x-1 mr-3">
                <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Finance • Taxes • Investment // Node: Alpha-7</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSelectKey}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all ${
              hasApiKey ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-rose-600/10 border-rose-500/50 text-rose-400 hover:bg-rose-600/20'
            }`}
          >
            <KeyIcon className="w-5 h-5" />
            <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">
              {hasApiKey ? 'Update Key' : 'Configure Key'}
            </span>
          </button>
          <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('fintech_auth'); }} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Market Watch */}
        <aside className="hidden lg:flex flex-col w-72 bg-slate-900/50 border-r border-slate-800 p-6 space-y-8 overflow-y-auto">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Security Context</h3>
            <div className="space-y-4">
               <div className={`p-3 rounded-lg border flex items-center space-x-3 ${hasApiKey ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                  <ShieldCheckIcon className={`w-5 h-5 ${hasApiKey ? 'text-emerald-500' : 'text-rose-500'}`} />
                  <div>
                    <div className={`text-[11px] font-bold uppercase ${hasApiKey ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {hasApiKey ? 'Vault Secure' : 'Key Required'}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono tracking-tighter">AES-256-GCM</div>
                  </div>
               </div>
               <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 flex items-center space-x-3">
                  <BoltIcon className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-[11px] font-bold text-blue-400 uppercase">AI Processing</div>
                    <div className="text-[9px] text-slate-500 font-mono tracking-tighter">PRECISION MODE</div>
                  </div>
               </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Market Watchlist</h3>
            <div className="space-y-4">
              {[
                { s: 'AAPL', p: '189.43', c: '+1.2%', up: true },
                { s: 'TSLA', p: '175.21', c: '-0.8%', up: false },
                { s: 'GOOGL', p: '142.33', c: '+2.4%', up: true },
                { s: 'MSFT', p: '415.10', c: '+0.5%', up: true }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <span className="text-xs font-bold">{item.s}</span>
                  <div className="text-right">
                    <div className="text-xs font-mono tabular-nums">{item.p}</div>
                    <div className={`text-[10px] font-bold ${item.up ? 'text-emerald-400' : 'text-rose-500'}`}>{item.c}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto space-y-8">
                <div className="relative">
                  <CpuChipIcon className="w-24 h-24 text-slate-800 animate-pulse" />
                  <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">FinTech AI Chatbot</h2>
                  <div className="flex justify-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                    <span>Finance</span>
                    <span className="text-slate-700">•</span>
                    <span>Investment</span>
                    <span className="text-slate-700">•</span>
                    <span>Taxation</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-md mx-auto">
                    Advanced analytical assistant for professional wealth management, multi-jurisdictional tax analysis, and equity research. 
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-6 max-w-md mx-auto">
                    {['Analyze S&P 500 Trends', 'Review Portfolio Tax', 'Explain Capital Gains', 'Market Risk Assessment'].map(q => (
                      <button key={q} onClick={() => { setInputText(q); }} className="text-[10px] font-bold uppercase tracking-widest p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all text-slate-400">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] md:max-w-[75%] ${
                  msg.sender === Sender.USER 
                    ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.2)]' 
                    : 'bg-slate-900 text-slate-100 border border-slate-800 shadow-xl'
                  } rounded-2xl overflow-hidden`}>
                  
                  {msg.files && msg.files.length > 0 && (
                    <div className="px-4 py-2 bg-black/20 flex gap-3 overflow-x-auto border-b border-white/5">
                      {msg.files.map((f, i) => (
                        <div key={i} className="flex items-center text-[10px] font-bold whitespace-nowrap bg-white/10 px-2 py-1 rounded">
                          <DocumentIcon className="w-3 h-3 mr-2" /> {f.name}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-5 text-[14px]">
                    {parseMessage(msg)}
                  </div>

                  <div className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-30 flex items-center ${msg.sender === Sender.USER ? 'justify-end' : 'justify-between'}`}>
                    {msg.sender === Sender.AI && (
                      <span className="flex items-center">
                        <ArrowsPointingOutIcon className="w-2.5 h-2.5 mr-2" /> 200_OK
                      </span>
                    )}
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl flex items-center space-x-4 shadow-xl">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  </div>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Processing Query</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <footer className="p-6 bg-slate-900/50 border-t border-slate-800 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto space-y-4">
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center bg-blue-600/10 border border-blue-500/30 rounded-lg px-3 py-1.5">
                      <DocumentIcon className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-xs font-bold text-blue-100">{f.name}</span>
                      <button onClick={() => setFiles([])} className="ml-3 text-blue-400 hover:text-rose-500 transition-colors">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative group">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Enter query for finance, taxes, or investments..."
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-5 py-5 pr-36 outline-none focus:border-blue-500/50 transition-all text-sm resize-none h-24 shadow-inner"
                />
                <div className="absolute right-4 bottom-4 flex items-center space-x-3">
                  <label className="p-2.5 text-slate-500 hover:text-blue-400 cursor-pointer rounded-xl hover:bg-slate-800 transition-all">
                    <input type="file" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setFiles([{ name: file.name, type: file.type, data: ev.target?.result as string }]);
                        file.type.startsWith('image/') ? reader.readAsDataURL(file) : reader.readAsText(file);
                      }
                    }} />
                    <PaperClipIcon className="w-6 h-6" />
                  </label>
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || (!inputText.trim() && files.length === 0)}
                    className="bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:bg-blue-500 disabled:opacity-20 disabled:grayscale transition-all transform active:scale-95"
                  >
                    <PaperAirplaneIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default App;
