'use client';

import React from 'react';
import { 
  Download, 
  Search, 
  Bell, 
  Clock, 
  UserCheck, 
  Building2, 
  SlidersHorizontal 
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopNavProps {
  activeTab: NavTab;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExportOpsReport: () => void;
  totalClaimsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  onExportOpsReport,
  totalClaimsCount
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Operations Pulse & Triage Command',
      subtitle: 'Catastrophe surge real-time analytics & priority actions for Lena Huber'
    },
    cases: {
      title: 'Claims Ledger & Case Management',
      subtitle: 'Comprehensive 270-claim queue with policy reconciliation & lifecycle actions'
    },
    ai_studio: {
      title: 'AI Studio & Prompt Engineering Lab',
      subtitle: 'Configure prompts, ground truth context, and test compliance against real claims'
    },
    rules_engine: {
      title: 'Business Rules & Policy Engine',
      subtitle: 'Codify Claims Handbook heuristics: approve, reject, or manual review criteria'
    }
  };

  const { title, subtitle } = titles[activeTab];

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-10 px-6 flex items-center justify-between">
      
      {/* Title & Context */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-sm font-bold text-gray-950 tracking-tight">{title}</h1>
          <span className="text-gray-300">·</span>
          <span className="text-[11px] font-mono font-medium text-[#cf5f09] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
            {totalClaimsCount} Claims In Queue
          </span>
        </div>
        <p className="text-[11px] text-gray-500 leading-none mt-0.5">{subtitle}</p>
      </div>

      {/* Right Controls: Search, Export, and Profile */}
      <div className="flex items-center space-x-3">
        
        {/* Global Search Bar */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search claims, plates, names..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-integral-copper-500 transition"
          />
        </div>

        {/* Export Ops Report */}
        <button
          onClick={onExportOpsReport}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-integral-copper-600 hover:bg-integral-copper-700 rounded-lg shadow-xs transition"
          title="Download complete operational audit spreadsheet"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {/* Profile Card */}
        <div className="pl-3 border-l border-gray-200 flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-integral-copper-500 to-integral-copper-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            LH
          </div>
          <div className="text-left hidden lg:block">
            <div className="text-xs font-bold text-gray-950 leading-tight">Lena Huber</div>
            <div className="text-[10px] text-gray-500 flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Desk #4 · 08:00 Shift</span>
            </div>
          </div>
        </div>

      </div>

    </header>
  );
};