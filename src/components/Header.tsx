'use client';

import React from 'react';
import { 
  CloudHail, Clock, ShieldCheck, Sliders, FileText, 
  Terminal, Sparkles, CheckCircle2, AlertCircle, ArrowUpRight 
} from 'lucide-react';

interface HeaderProps {
  onOpenMemo: () => void;
  onOpenWorkLog: () => void;
  onOpenSandbox: () => void;
  totalClaims: number;
  handledCount: number;
  hoursSaved: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMemo,
  onOpenWorkLog,
  onOpenSandbox,
  totalClaims,
  handledCount,
  hoursSaved
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Shift Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-gradient-to-tr from-sky-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <CloudHail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm tracking-tight text-white">Kumulus</span>
                  <span className="text-[11px] font-medium text-slate-500">/</span>
                  <span className="text-xs font-medium text-slate-300">Claims Dispatch OS</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Tue 14 Jul · 08:00 CEST</span>
                  </span>
                  <span>·</span>
                  <span className="text-slate-200 font-medium">Lena Huber</span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>Munich Storm Kumul · 9,140 Claims Ingested</span>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSandbox}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Rule Sandbox</span>
            </button>

            <button
              onClick={onOpenWorkLog}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>Engineering Log</span>
            </button>

            <button
              onClick={onOpenMemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1-Page Memo</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
