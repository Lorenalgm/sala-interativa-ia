import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { LandingPage } from './components/Landing/LandingPage';
import { LibraryPage } from './components/Library/LibraryPage';
import { ScriptPage } from './components/Library/ScriptPage';
import { getScript } from './data/scripts';
import {
  loadClassroom,
  loadClassrooms,
  setActiveClassroom,
  loadQuestions,
} from './services/storageService';
import { Classroom, HAND_SCRIPT_IDS, HandScriptId, Question, ScriptId } from './types';

// Telas carregadas só quando abertas: a primeira abertura do app fica leve
const QuestionBank = lazy(() => import('./components/Questions/QuestionBank').then((m) => ({ default: m.QuestionBank })));
const BoardFlow = lazy(() => import('./components/Board/BoardFlow').then((m) => ({ default: m.BoardFlow })));
const HandModelFlow = lazy(() => import('./components/Hand/HandModels'));
const QuestionFlow = lazy(() => import('./components/Conduct/QuestionFlow').then((m) => ({ default: m.QuestionFlow })));
const CameraTest = lazy(() => import('./components/Camera/CameraTest').then((m) => ({ default: m.CameraTest })));
const CardPrintView = lazy(() => import('./components/CardGenerator/CardPrintView').then((m) => ({ default: m.CardPrintView })));
const ClassroomManager = lazy(() => import('./components/Classroom/ClassroomManager').then((m) => ({ default: m.ClassroomManager })));
const PerformanceSummary = lazy(() => import('./components/Reports/PerformanceSummary').then((m) => ({ default: m.PerformanceSummary })));

interface Route {
  tab: ActiveTab;
  scriptId: ScriptId;
}

const TAB_PATHS: Partial<Record<ActiveTab, string>> = {
  home: '/',
  library: '/biblioteca',
  questions: '/perguntas',
  classroom: '/turma',
  reports: '/desempenho',
  camera: '/camera',
  cards: '/cartas',
};

const SCRIPT_IDS: ScriptId[] = ['quick-question', 'group-draw', 'peer-instruction', 'interactive-board', ...HAND_SCRIPT_IDS];

const buildPath = ({ tab, scriptId }: Route): string => {
  if (tab === 'script') return `/modelos/${scriptId}`;
  if (tab === 'prepare') return `/modelos/${scriptId}/aula`;
  return TAB_PATHS[tab] ?? '/';
};

// Endereço desconhecido cai no início; /atividades/ e /roteiros/ são endereços antigos dos modelos
const parsePath = (pathname: string): Route => {
  const path = pathname.replace(/\/+$/, '') || '/';
  const scriptId: ScriptId = 'quick-question';
  const match = path.match(/^\/(?:modelos|atividades|roteiros)\/([^/]+)(\/aula)?$/);
  if (match && SCRIPT_IDS.includes(match[1] as ScriptId)) {
    return { tab: match[2] ? 'prepare' : 'script', scriptId: match[1] as ScriptId };
  }
  const tab = (Object.keys(TAB_PATHS) as ActiveTab[]).find((t) => TAB_PATHS[t] === path);
  return { tab: tab ?? 'home', scriptId };
};

export const App: React.FC = () => {
  const [route, setRoute] = useState<Route>(() => parsePath(window.location.pathname));
  const activeTab = route.tab;
  const activeScriptId = route.scriptId;
  const isHand = (HAND_SCRIPT_IDS as ScriptId[]).includes(activeScriptId);
  const [classroom, setClassroom] = useState<Classroom>(() => loadClassroom());
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => loadClassrooms());
  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions());
  const [cameraActive, setCameraActive] = useState(false);
  // Alunos já marcados ao abrir os cartões (vindo da Turma); null = todos
  const [cardsFor, setCardsFor] = useState<number[] | null>(null);
  const [isRoundInProgress, setIsRoundInProgress] = useState(false);

  // Navega para uma aba empurrando a URL correspondente no histórico
  const go = (tab: ActiveTab, scriptId: ScriptId = activeScriptId) => {
    const next: Route = { tab, scriptId };
    const path = buildPath(next);
    if (path !== window.location.pathname) window.history.pushState(null, '', path);
    setRoute(next);
    setCardsFor(null);
  };

  // Voltar/avançar do navegador
  useEffect(() => {
    const onPop = () => {
      setIsRoundInProgress(false);
      setRoute(parsePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Trocar de aba no meio de uma rodada descarta as respostas: pede confirmação
  const handleSelectTab = (tab: ActiveTab, scriptId?: ScriptId) => {
    if (tab === activeTab && (scriptId ?? activeScriptId) === activeScriptId) return;
    if (
      isRoundInProgress &&
      !confirm('Sair da rodada em andamento? As respostas desta rodada não serão salvas.')
    ) {
      return;
    }
    setIsRoundInProgress(false);
    go(tab, scriptId);
  };

  // Cada aba abre do topo, sem herdar a rolagem da anterior
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const refreshData = () => {
    setClassroom(loadClassroom());
    setClassrooms(loadClassrooms());
    setQuestions(loadQuestions());
  };

  // Troca a turma ativa: todas as telas passam a mostrar só os alunos e as rodadas dela
  const switchClassroom = (id: string) => {
    setActiveClassroom(id);
    refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200 text-base-content">
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        cameraActive={cameraActive}
        classrooms={classrooms}
        activeClassroomId={classroom.id}
        onSwitchClassroom={switchClassroom}
        switchLocked={isRoundInProgress}
      />

      {/* A chave remonta as telas ao trocar de turma: nada da turma anterior fica na tela */}
      <main key={classroom.id} className="flex-1">
        <Suspense fallback={<p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 text-lg text-base-content/70" role="status">Carregando…</p>}>
        {activeTab === 'home' && (
          <LandingPage
            onOpenLibrary={() => handleSelectTab('library')}
            onOpenQuestions={() => handleSelectTab('questions')}
            onOpenReports={() => handleSelectTab('reports')}
            onOpenScript={(id) => handleSelectTab('script', id)}
          />
        )}

        {activeTab === 'library' && (
          <LibraryPage
            onNavigate={handleSelectTab}
            onOpenScript={(id) => go('script', id)}
            studentsCount={classroom.students.length}
          />
        )}

        {activeTab === 'script' && (
          <ScriptPage
            script={getScript(activeScriptId)}
            onBack={() => go('library')}
            onPrepare={() => go('prepare')}
          />
        )}

        {activeTab === 'prepare' && activeScriptId === 'interactive-board' && (
          <BoardFlow
            questions={questions}
            students={classroom.students}
            onBack={() => go('script')}
            onCameraStatusChange={setCameraActive}
            onRoundProgressChange={setIsRoundInProgress}
          />
        )}

        {activeTab === 'prepare' && isHand && (
          <HandModelFlow
            scriptId={activeScriptId as HandScriptId}
            onBack={() => go('script')}
            onCameraStatusChange={setCameraActive}
            onRoundProgressChange={setIsRoundInProgress}
          />
        )}

        {activeTab === 'prepare' && activeScriptId !== 'interactive-board' && !isHand && (
          <QuestionFlow
            scriptId={activeScriptId}
            questions={questions}
            students={classroom.students}
            onRefreshQuestions={refreshData}
            onSessionComplete={refreshData}
            onCameraStatusChange={setCameraActive}
            onNavigateToReports={() => handleSelectTab('reports')}
            onRoundProgressChange={setIsRoundInProgress}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionBank questions={questions} onChange={refreshData} />
        )}

        {activeTab === 'camera' && (
          <CameraTest students={classroom.students} onCameraStatusChange={setCameraActive} />
        )}

        {activeTab === 'cards' && (
          <CardPrintView key={cardsFor?.join(',') ?? 'todos'} students={classroom.students} initialSelected={cardsFor} />
        )}

        {activeTab === 'classroom' && (
          <ClassroomManager
            classroom={classroom}
            onRefresh={refreshData}
            classrooms={classrooms}
            onSwitchClassroom={switchClassroom}
            onNavigateToCards={(ids) => {
              go('cards');
              setCardsFor(ids ?? null);
            }}
          />
        )}

        {activeTab === 'reports' && (
          <PerformanceSummary
            classroom={classroom}
            questions={questions}
            onRefresh={refreshData}
          />
        )}
        </Suspense>
      </main>
    </div>
  );
};

export default App;
