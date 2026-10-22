'use client';

import React from 'react';
import { 
  Clock, ShieldCheck, Sliders, 
  Terminal, Sparkles, CheckCircle2, AlertCircle, Download, Activity 
} from 'lucide-react';

interface HeaderProps {
  onOpenWorkLog: () => void;
  onOpenSandbox: () => void;
  onExportOpsReport: () => void;
  totalClaims: number;
  handledCount: number;
  hoursSaved: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWorkLog,
  onOpenSandbox,
  onExportOpsReport,
  totalClaims,
  handledCount,
  hoursSaved
}) => {
  return (
    <header className="border-b border-integral-midnight-500/20 bg-integral-midnight-900/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Shift Info with Integral Logo Mark */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              
              {/* Official Integral Mark */}
              <div className="h-9 w-9 bg-integral-copper-600 text-white rounded-xl flex items-center justify-center p-2.5 shadow-md shadow-integral-copper-600/20">
                <svg viewBox="0 0 28 28" fill="none" className="w-full h-full text-white">
                  <path d="M26.0431 0H1.95001C0.869692 0 0 0.869694 0 1.95001V26.05C0 27.1236 0.869692 28 1.95001 28H26.05C27.1236 28 28 27.1303 28 26.05V1.95001C28 0.876487 27.1303 0 26.05 0H26.0431ZM16.497 23.1059L12.9503 21.0674C12.0466 20.5511 11.4895 19.5863 11.4895 18.5467C11.4895 17.5072 12.0874 16.4812 13.0386 15.9784L16.4902 14.1507L16.497 23.1059ZM14.9478 12.2413L11.4963 14.069V5.11391L15.043 7.15225C15.9466 7.66864 16.5037 8.63343 16.5037 9.67297C16.5037 10.7125 15.9058 11.7385 14.9546 12.2413H14.9478Z" fill="currentColor"/>
                </svg>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm tracking-tight text-white font-mono">INTEGRAL</span>
                  <span className="text-[11px] font-medium text-integral-midnight-400">×</span>
                  <span className="text-xs font-medium text-integral-midnight-200">Claims Operations OS</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-integral-midnight-300">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-integral-copper-400" />
                    <span>Tue 14 Jul · 08:00 CEST</span>
                  </span>
                  <span>·</span>
                  <span className="text-white font-medium">Ops Desk: Lena Huber</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-integral-copper-600/10 border border-integral-copper-500/20 text-[11px] text-integral-copper-400">
              <span className="h-1.5 w-1.5 rounded-full bg-integral-copper-500 animate-pulse" />
              <span>Munich Storm Kumul · 9,140 Claims Ingested</span>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSandbox}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-integral-midnight-200 hover:text-white bg-integral-midnight-800/80 hover:bg-integral-midnight-700 border border-integral-midnight-500/30 rounded-lg transition"
            >
              <Sliders className="w-3.5 h-3.5 text-integral-copper-400" />
              <span>Rule Sandbox</span>
            </button>

            <button
              onClick={onOpenWorkLog}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-integral-midnight-200 hover:text-white bg-integral-midnight-800/80 hover:bg-integral-midnight-700 border border-integral-midnight-500/30 rounded-lg transition"
            >
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Engineering Log</span>
            </button>

            <button
              onClick={onExportOpsReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-integral-copper-600 hover:bg-integral-copper-500 rounded-lg shadow-sm shadow-integral-copper-600/30 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ops Report</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
