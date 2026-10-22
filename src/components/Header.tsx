'use client';

import React from 'react';
import { CloudHail, Clock, Shield, Sliders, FileText, Terminal, Sparkles } from 'lucide-react';

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
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Context */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-sky-500 rounded-xl text-white shadow-lg shadow-sky-500/20">
                <CloudHail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base text-white tracking-tight">KUMULUS</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded">
                    Claims Dispatch Cockpit
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Tuesday, 14 July 2026 · 08:00 CEST</span>
                  <span>·</span>
                  <span className="text-slate-300 font-medium">Lena Huber</span>
                </div>
              </div>
            </div>

            {/* Munich Storm Indicator */}
            <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-slate-800 text-xs text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span><strong>Munich Hailstorm:</strong> 9,140 total claims across Kumulus (30x surge)</span>
            </div>
          </div>

          {/* Quick Metrics & Modals */}
          <div className="flex items-center space-x-3">
            
            {/* Live Progress Pill */}
            <div className="hidden sm:flex items-center space-x-3 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Triage Progress</span>
                <span className="font-bold text-white">{handledCount} / {totalClaims}</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Hours Saved</span>
                <span className="font-bold text-emerald-400">+{hoursSaved.toFixed(1)} hrs</span>
              </div>
            </div>

            {/* Rule Simulator Button */}
            <button
              onClick={onOpenSandbox}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Rule Simulator</span>
            </button>

            {/* 1-Page Memo Button */}
            <button
              onClick={onOpenMemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-sm transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1-Page Memo</span>
            </button>

            {/* Work Log Button */}
            <button
              onClick={onOpenWorkLog}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Work Log</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
