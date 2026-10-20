import React from 'react';
import { Library, BarChart2, Users, Camera } from 'lucide-react';

export type ActiveTab = 'home' | 'library' | 'script' | 'prepare' | 'cards' | 'camera' | 'classroom' | 'reports';

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
    { id: 'library' as ActiveTab, label: 'Biblioteca', icon: Library },
    { id: 'classroom' as ActiveTab, label: 'Turma', icon: Users },
    { id: 'reports' as ActiveTab, label: 'Desempenho', icon: BarChart2 },
  ];

  return (
    <header className="no-print navbar sticky top-0 z-50 bg-primary text-primary-content border-b border-white/15 px-0">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <button
          onClick={() => onSelectTab('home')}
          className="btn btn-ghost px-2 gap-2 text-2xl font-display font-extrabold tracking-tight text-primary-content hover:bg-white/10 group"
        >
          <span className="flex items-end gap-0.5" aria-hidden="true">
            <span className="w-1.5 h-3.5 rounded-sm bg-secondary" />
            <span className="w-1.5 h-4 rounded-sm bg-accent group-hover:-translate-y-0.5 transition-transform" />
            <span className="w-1.5 h-3 rounded-sm bg-white" />
          </span>
          ClassPlay
        </button>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            // A página de um roteiro e a preparação da aula pertencem à Biblioteca
            const isActive =
              activeTab === item.id ||
              (item.id === 'library' && (activeTab === 'script' || activeTab === 'prepare'));

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`btn btn-sm rounded-full font-medium ${
                  isActive
                    ? 'bg-white text-primary border-white hover:bg-white'
                    : 'btn-ghost text-primary-content/85 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* O estado da câmera é também o atalho para o teste da câmera */}
        <button
          onClick={() => onSelectTab('camera')}
          aria-current={activeTab === 'camera' ? 'page' : undefined}
          aria-label={`Testar câmera (${cameraActive ? 'ligada' : 'desligada'})`}
          className={`btn btn-sm rounded-full gap-2 font-medium ${
            activeTab === 'camera'
              ? 'bg-white text-primary border-white hover:bg-white'
              : 'bg-white/10 border-white/25 text-primary-content hover:bg-white/20'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-success' : 'bg-secondary'}`}
            aria-hidden="true"
          />
          <Camera className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">
            {cameraActive ? 'Câmera ligada' : 'Testar câmera'}
          </span>
        </button>
      </div>
    </header>
  );
};
