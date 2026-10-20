import React from 'react';
import {
  Library,
  Printer,
  BarChart2,
  Users,
  Camera,
} from 'lucide-react';

export type ActiveTab = 'library' | 'script' | 'prepare' | 'cards' | 'camera' | 'classroom' | 'reports';

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
    { id: 'cards' as ActiveTab, label: 'Cartões', icon: Printer },
    { id: 'camera' as ActiveTab, label: 'Teste da câmera', icon: Camera },
    { id: 'classroom' as ActiveTab, label: 'Turma', icon: Users },
    { id: 'reports' as ActiveTab, label: 'Desempenho', icon: BarChart2 },
  ];

  return (
    <header className="no-print navbar sticky top-0 z-50 bg-base-100/95 backdrop-blur-md border-b border-base-300 px-0">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <button
          onClick={() => onSelectTab('library')}
          className="btn btn-ghost px-2 gap-1.5 text-2xl font-extrabold tracking-tight group"
        >
          ClassPlay
          <span className="w-2 h-2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
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
                  isActive ? 'btn-neutral' : 'btn-ghost text-base-content/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div
          className={`hidden md:inline-flex badge gap-1.5 py-3 font-medium ${
            cameraActive ? 'badge-success' : 'badge-ghost text-base-content/70'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          {cameraActive ? 'Câmera ligada' : 'Câmera desligada'}
        </div>
      </div>
    </header>
  );
};
