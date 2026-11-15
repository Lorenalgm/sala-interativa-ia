import React from 'react';
import { Home, Library, BarChart2, Users, Camera, ListChecks } from 'lucide-react';

export type ActiveTab = 'home' | 'library' | 'script' | 'prepare' | 'cards' | 'camera' | 'classroom' | 'reports' | 'questions';

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
    { id: 'library' as ActiveTab, label: 'Biblioteca', icon: Library },
    { id: 'questions' as ActiveTab, label: 'Perguntas', icon: ListChecks },
    { id: 'classroom' as ActiveTab, label: 'Turma', icon: Users },
    { id: 'reports' as ActiveTab, label: 'Desempenho', icon: BarChart2 },
  ];

  // Barra clara como a de navegação do sistema: material translúcido só aqui, conteúdo opaco embaixo.
  // Item ativo em azul cheio, para ser lido de longe mesmo com a luz da sala acesa.
  const pill =
    'inline-flex items-center gap-2 min-h-[2.75rem] rounded-full px-3.5 text-[0.9375rem] font-semibold motion-safe:transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

  return (
    <header className="no-print sticky top-0 z-50 bg-white/90 backdrop-blur-xl backdrop-saturate-150 border-b border-base-300">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        <button
          onClick={() => onSelectTab('home')}
          aria-label="ClassPlay, início"
          className="group shrink-0 inline-flex items-center gap-2 min-h-[2.75rem] rounded-xl px-2 -ml-2 text-2xl font-display font-bold tracking-tight hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {/* Três lombadas nas cores dos modelos */}
          <span className="flex items-end gap-0.5" aria-hidden="true">
            <span className="w-1.5 h-3.5 rounded-sm bg-[#3634a3]" />
            <span className="w-1.5 h-4 rounded-sm bg-[#c93400] motion-safe:transition-transform group-hover:-translate-y-0.5" />
            <span className="w-1.5 h-3 rounded-sm bg-[#006e7f]" />
          </span>
          <span className="hidden md:inline">ClassPlay</span>
        </button>

        <nav className="min-w-0 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            // A página de um modelo e a preparação da aula pertencem à Biblioteca
            const isActive =
              activeTab === item.id ||
              (item.id === 'library' && (activeTab === 'script' || activeTab === 'prepare'));

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`${pill} ${
                  isActive ? 'bg-primary text-primary-content' : 'text-base-content hover:bg-black/5'
                }`}
              >
                <Icon className="w-[1.125rem] h-[1.125rem]" aria-hidden="true" />
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
          className={`${pill} shrink-0 border ${
            activeTab === 'camera'
              ? 'bg-primary text-primary-content border-primary'
              : 'bg-base-100 border-base-300 text-base-content hover:bg-black/5'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-success' : 'bg-warning'}`}
            aria-hidden="true"
          />
          <Camera className="w-[1.125rem] h-[1.125rem]" aria-hidden="true" />
          <span className="hidden sm:inline">
            {cameraActive ? 'Câmera ligada' : 'Testar câmera'}
          </span>
        </button>
      </div>
    </header>
  );
};
