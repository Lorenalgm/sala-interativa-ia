import React, { useEffect, useRef, useState } from 'react';
import { Home, Library, BarChart2, Users, Camera, ListChecks, Check, ChevronDown, Settings2 } from 'lucide-react';
import { Classroom } from '../types';

export type ActiveTab = 'home' | 'library' | 'script' | 'prepare' | 'cards' | 'camera' | 'classroom' | 'reports' | 'questions';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  cameraActive: boolean;
  classrooms: Classroom[];
  activeClassroomId: string;
  onSwitchClassroom: (id: string) => void;
  // Durante uma rodada a turma não troca
  switchLocked: boolean;
}

// Menu da turma ativa, no formato dos menus do sistema
const ClassroomMenu: React.FC<{
  classrooms: Classroom[];
  activeId: string;
  locked: boolean;
  onSwitch: (id: string) => void;
  onManage: () => void;
}> = ({ classrooms, activeId, locked, onSwitch, onManage }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = classrooms.find((c) => c.id === activeId);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={locked}
        aria-haspopup="menu"
        aria-expanded={open}
        title={locked ? 'Termine a rodada para trocar de turma' : 'Trocar de turma'}
        className="inline-flex items-center gap-2 min-h-[2.75rem] max-w-[13rem] rounded-full px-3.5 text-[0.9375rem] font-semibold bg-[#f2f2f7] hover:bg-[#e3e3e8] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Users className="w-[1.125rem] h-[1.125rem] shrink-0" aria-hidden="true" />
        <span className="truncate">{active?.name ?? 'Turma'}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 motion-safe:transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Turmas"
          className="absolute right-0 mt-2 w-72 rounded-[0.875rem] bg-white border border-base-300 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.35)] p-1.5 z-50"
        >
          <p className="px-3 pt-1.5 pb-1 text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/60">Turmas</p>
          {classrooms.map((c) => {
            const on = c.id === activeId;
            return (
              <button
                key={c.id}
                role="menuitemradio"
                aria-checked={on}
                onClick={() => {
                  setOpen(false);
                  if (!on) onSwitch(c.id);
                }}
                className="w-full flex items-center gap-2.5 min-h-[2.75rem] px-3 rounded-[0.5rem] text-left text-base hover:bg-primary hover:text-primary-content focus-visible:bg-primary focus-visible:text-primary-content focus-visible:outline-none"
              >
                <Check className={`w-4 h-4 shrink-0 ${on ? '' : 'invisible'}`} aria-hidden="true" />
                <span className="flex-1 truncate font-medium">{c.name}</span>
                <span className="text-[0.875rem] opacity-70">{c.students.length}</span>
              </button>
            );
          })}
          <div className="my-1.5 h-px bg-base-300" />
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onManage();
            }}
            className="w-full flex items-center gap-2.5 min-h-[2.75rem] px-3 rounded-[0.5rem] text-left text-base hover:bg-primary hover:text-primary-content focus-visible:bg-primary focus-visible:text-primary-content focus-visible:outline-none"
          >
            <Settings2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            Criar ou editar turmas
          </button>
        </div>
      )}
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  cameraActive,
  classrooms,
  activeClassroomId,
  onSwitchClassroom,
  switchLocked,
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

        <div className="flex items-center gap-2 shrink-0">
        <ClassroomMenu
          classrooms={classrooms}
          activeId={activeClassroomId}
          locked={switchLocked}
          onSwitch={onSwitchClassroom}
          onManage={() => onSelectTab('classroom')}
        />
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
      </div>
    </header>
  );
};
