import React from 'react';
import {
  HelpCircle,
  Activity,
  Printer,
  BarChart2,
  Users,
  Camera,
  Home,
} from 'lucide-react';

export type ActiveTab = 'home' | 'questions' | 'exercises' | 'cards' | 'classroom' | 'reports';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  cameraActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  cameraActive,
}) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'Início', icon: Home },
    { id: 'questions' as ActiveTab, label: 'Perguntas', icon: HelpCircle },
    { id: 'exercises' as ActiveTab, label: 'Exercícios', icon: Activity },
    { id: 'cards' as ActiveTab, label: 'Cartões', icon: Printer },
    { id: 'classroom' as ActiveTab, label: 'Turma', icon: Users },
    { id: 'reports' as ActiveTab, label: 'Desempenho', icon: BarChart2 },
  ];

  return (
    <header className="no-print bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo clean minimalista: somente ClassPlay */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-1.5 text-left focus:outline-none group"
          >
            <span className="font-extrabold text-2xl tracking-tight text-zinc-950">
              ClassPlay
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
          </button>

          {/* Navegação em abas no estilo clean da Apple / Vercel */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status sutil da câmera */}
          <div className="hidden md:flex items-center">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                cameraActive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-500'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{cameraActive ? 'Câmera ativa' : 'Câmera inativa'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
