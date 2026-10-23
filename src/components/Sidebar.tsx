'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Bot, 
  Scale, 
  Terminal, 
  ShieldCheck, 
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';

export type NavTab = 'dashboard' | 'cases' | 'ai_studio' | 'rules_engine';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenWorkLog: () => void;
  openCasesCount: number;
  urgentCasesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenWorkLog,
  openCasesCount,
  urgentCasesCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Operations Pulse',
      description: 'KPIs, capacity & alert tiles',
      icon: LayoutDashboard,
      badge: urgentCasesCount > 0 ? `${urgentCasesCount} urgent` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      id: 'cases' as NavTab,
      label: 'Case Management',
      description: 'Detailed claim view & actions',
      icon: FolderKanban,
      badge: `${openCasesCount}`,
      badgeColor: 'bg-gray-100 text-gray-700 border-gray-200'
    },
    {
      id: 'ai_studio' as NavTab,
      label: 'AI Studio & Prompt Lab',
      description: 'Context, prompts & live testing',
      icon: Bot,
      badge: 'Interactive',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'rules_engine' as NavTab,
      label: 'Business Rule Engine',
      description: 'Heuristic rules & live simulator',
      icon: Scale,
      badge: '7 Rules',
      badgeColor: 'bg-orange-50 text-[#cf5f09] border-orange-200'
    }
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20 select-none">
      
      {/* Brand & Organization */}
      <div>
        <div className="h-16 px-5 border-b border-gray-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Integral Mark */}
            <div className="h-9 w-9 bg-integral-copper-600 text-white rounded-xl flex items-center justify-center p-2 shadow-xs shadow-integral-copper-600/20">
              <svg viewBox="0 0 28 28" fill="none" className="w-full h-full text-white">
                <path d="M26.0431 0H1.95001C0.869692 0 0 0.869694 0 1.95001V26.05C0 27.1236 0.869692 28 1.95001 28H26.05C27.1236 28 28 27.1303 28 26.05V1.95001C28 0.876487 27.1303 0 26.05 0H26.0431ZM16.497 23.1059L12.9503 21.0674C12.0466 20.5511 11.4895 19.5863 11.4895 18.5467C11.4895 17.5072 12.0874 16.4812 13.0386 15.9784L16.4902 14.1507L16.497 23.1059ZM14.9478 12.2413L11.4963 14.069V5.11391L15.043 7.15225C15.9466 7.66864 16.5037 8.63343 16.5037 9.67297C16.5037 10.7125 15.9058 11.7385 14.9546 12.2413H14.9478Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-gray-950 font-mono">INTEGRAL</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-orange-50 text-[#cf5f09] border border-orange-200">OS</span>
              </div>
              <span className="text-[11px] text-gray-500 block leading-tight font-medium">Kumulus Claims Platform</span>
            </div>
          </div>
        </div>

        {/* Tenant Environment Banner */}
        <div className="p-3 mx-3 my-3 bg-gray-50/80 border border-gray-200/80 rounded-xl">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-gray-800 flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Munich Hail Kumul 2026</span>
            </span>
            <span className="font-mono text-gray-400">9,140 claims</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1 flex items-center justify-between">
            <span>Desk #4 · Lena Huber</span>
            <span className="text-integral-copper-600 font-semibold">270 Active</span>
          </div>
        </div>

        {/* Navigation Links Grouped by Operational Layer */}
        <div className="px-3 space-y-4">
          
          {/* Group 1: Lena's Operations Cockpit */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Operations · Lena's Desk
            </div>
            
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between group ${
                    isActive
                      ? 'bg-integral-copper-600 text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-integral-copper-600'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate leading-snug">{item.label}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                      isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Group 2: Platform Governance & Rule Architecture */}
          <div className="space-y-1 pt-2 border-t border-gray-100">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Platform Governance</span>
              <span className="text-[9px] font-normal text-integral-copper-600 font-mono">Lead / Admin</span>
            </div>

            {navItems.slice(2, 4).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between group ${
                    isActive
                      ? 'bg-integral-copper-600 text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-integral-copper-600'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate leading-snug">{item.label}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                      isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Bottom Information & Engineering Work Log */}
      <div className="p-3 border-t border-gray-200/80 space-y-2">
        <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-200/60 text-[11px] text-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>GoBD Audit Trail</span>
            </span>
            <span className="text-emerald-700 font-mono text-[10px] font-semibold">Active</span>
          </div>
          <div className="text-[10px] text-gray-500">
            Immutable logs & timestamps recorded for all decisions
          </div>
        </div>

        <button
          onClick={onOpenWorkLog}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-950 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition shadow-2xs"
        >
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-sky-600" />
            <span>Audit Work Log</span>
          </div>
          <ChevronRight className="w-3 h-3 text-gray-400" />
        </button>
      </div>

    </aside>
  );
};