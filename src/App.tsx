import React, { useEffect, useState } from 'react';
import { QuestionBank } from './components/Questions/QuestionBank';
import { Navbar, ActiveTab } from './components/Navbar';
import { LandingPage } from './components/Landing/LandingPage';
import { LibraryPage } from './components/Library/LibraryPage';
import { ScriptPage } from './components/Library/ScriptPage';
import { BoardFlow } from './components/Board/BoardFlow';
import { QuestionFlow } from './components/Conduct/QuestionFlow';
import { CameraTest } from './components/Camera/CameraTest';
import { CardPrintView } from './components/CardGenerator/CardPrintView';
import { ClassroomManager } from './components/Classroom/ClassroomManager';
import { PerformanceSummary } from './components/Reports/PerformanceSummary';
import { getScript } from './data/scripts';
import {
  loadClassroom,
  loadQuestionHistory,
  loadQuestions,
} from './services/storageService';
import { Classroom, Question, QuestionSessionRecord, ScriptId } from './types';

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

const SCRIPT_IDS: ScriptId[] = ['quick-question', 'group-draw', 'peer-instruction', 'interactive-board'];

const buildPath = ({ tab, scriptId }: Route): string => {
  if (tab === 'script') return `/roteiros/${scriptId}`;
  if (tab === 'prepare') return `/roteiros/${scriptId}/aula`;
  return TAB_PATHS[tab] ?? '/';
};

// Endereço desconhecido cai no início
const parsePath = (pathname: string): Route => {
  const path = pathname.replace(/\/+$/, '') || '/';
  const scriptId: ScriptId = 'quick-question';
  const match = path.match(/^\/roteiros\/([^/]+)(\/aula)?$/);
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
  const [classroom, setClassroom] = useState<Classroom>(() => loadClassroom());
  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions());
  const [history, setHistory] = useState<QuestionSessionRecord[]>(() =>
    loadQuestionHistory()
  );
  const [cameraActive, setCameraActive] = useState(false);
  const [isRoundInProgress, setIsRoundInProgress] = useState(false);

  // Navega para uma aba empurrando a URL correspondente no histórico
  const go = (tab: ActiveTab, scriptId: ScriptId = activeScriptId) => {
    const next: Route = { tab, scriptId };
    const path = buildPath(next);
    if (path !== window.location.pathname) window.history.pushState(null, '', path);
    setRoute(next);
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
    setQuestions(loadQuestions());
    setHistory(loadQuestionHistory());
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200 text-base-content">
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        cameraActive={cameraActive}
      />

      <main className="flex-1">
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

        {activeTab === 'prepare' && activeScriptId !== 'interactive-board' && (
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
          <CardPrintView students={classroom.students} />
        )}

        {activeTab === 'classroom' && (
          <ClassroomManager
            classroom={classroom}
            onRefresh={refreshData}
            onNavigateToCards={() => go('cards')}
          />
        )}

        {activeTab === 'reports' && (
          <PerformanceSummary
            classroom={classroom}
            history={history}
            onRefresh={refreshData}
          />
        )}
      </main>
    </div>
  );
};

export default App;
