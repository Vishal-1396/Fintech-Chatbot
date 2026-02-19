
import React, { useState } from 'react';
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  EnvelopeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-500/20 mb-6 border border-blue-400/20">
            <ChartBarIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">FinTech AI Chatbot</h1>
          <p className="text-slate-500 text-xs mt-3 font-bold uppercase tracking-[0.3em]">Institutional Grade Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden p-8 md:p-10">
          <div className="flex items-center justify-center space-x-2 mb-10 py-1.5 px-4 bg-emerald-500/5 border border-emerald-500/20 rounded-full w-fit mx-auto">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Tier-1 Encrypted Session</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Terminal ID (Email)</label>
              <div className="relative group">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none text-sm text-white placeholder-slate-700 font-mono"
                  placeholder="ID_SECURE_NODE"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Access Key</label>
              <div className="relative group">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none text-sm text-white placeholder-slate-700 font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] py-1">
              <label className="flex items-center text-slate-500 cursor-pointer font-bold uppercase tracking-widest">
                <input type="checkbox" className="mr-2 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900" />
                Persistence
              </label>
              <a href="#" className="text-blue-500 font-black uppercase tracking-widest hover:text-blue-400 transition-colors">Recovery</a>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center space-x-3 uppercase tracking-[0.2em] ${isLoading ? 'opacity-50' : ''}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Initialize Connection</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-800 text-center">
             <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">Secure Node: FINTECH-NODE-7</p>
          </div>
        </div>

        <p className="text-center mt-8 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
          No Terminal Access? <a href="#" className="text-blue-500 hover:underline">Request Credentials</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
