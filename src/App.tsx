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

export const App: React.FC = () => {
  // A apresentação aparece só na primeira visita; depois o app abre direto na biblioteca
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      return localStorage.getItem('classplay:visitou') ? 'library' : 'home';
    } catch {
      return 'library';
    }
  });
  const [activeScriptId, setActiveScriptId] = useState<ScriptId>('quick-question');
  const [classroom, setClassroom] = useState<Classroom>(() => loadClassroom());
  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions());
  const [history, setHistory] = useState<QuestionSessionRecord[]>(() =>
    loadQuestionHistory()
  );
  const [cameraActive, setCameraActive] = useState(false);
  const [isRoundInProgress, setIsRoundInProgress] = useState(false);

  // Trocar de aba no meio de uma rodada descarta as respostas: pede confirmação
  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === activeTab) return;
    if (
      isRoundInProgress &&
      !confirm('Sair da rodada em andamento? As respostas desta rodada não serão salvas.')
    ) {
      return;
    }
    setIsRoundInProgress(false);
    if (activeTab === 'home') {
      try {
        localStorage.setItem('classplay:visitou', '1');
      } catch {
        // sem armazenamento: a apresentação volta a aparecer na próxima visita
      }
    }
    setActiveTab(tab);
  };

  // Cada aba abre do topo, sem herdar a rolagem da anterior
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

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
            onOpenScript={(id) => {
              setActiveScriptId(id);
              handleSelectTab('script');
            }}
          />
        )}

        {activeTab === 'library' && (
          <LibraryPage
            onNavigate={handleSelectTab}
            onOpenScript={(id) => {
              setActiveScriptId(id);
              setActiveTab('script');
            }}
            studentsCount={classroom.students.length}
          />
        )}

        {activeTab === 'script' && (
          <ScriptPage
            script={getScript(activeScriptId)}
            onBack={() => setActiveTab('library')}
            onPrepare={() => setActiveTab('prepare')}
          />
        )}

        {activeTab === 'prepare' && activeScriptId === 'interactive-board' && (
          <BoardFlow
            questions={questions}
            students={classroom.students}
            onBack={() => setActiveTab('script')}
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
            onNavigateToCards={() => setActiveTab('cards')}
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
