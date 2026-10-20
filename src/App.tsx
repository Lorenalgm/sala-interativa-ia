import React, { useEffect, useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { LibraryPage } from './components/Library/LibraryPage';
import { ScriptPage } from './components/Library/ScriptPage';
import { QuestionFlow } from './components/Conduct/QuestionFlow';
import { CardPrintView } from './components/CardGenerator/CardPrintView';
import { ClassroomManager } from './components/Classroom/ClassroomManager';
import { PerformanceSummary } from './components/Reports/PerformanceSummary';
import { getScript } from './data/scripts';
import {
  loadClassroom,
  loadQuestionHistory,
  loadQuestions,
  loadRoundHistory,
} from './services/storageService';
import { Classroom, Question, QuestionSessionRecord, ScriptId } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('library');
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
        {activeTab === 'library' && (
          <LibraryPage
            onNavigate={handleSelectTab}
            onOpenScript={(id) => {
              setActiveScriptId(id);
              setActiveTab('script');
            }}
            studentsCount={classroom.students.length}
            roundsCount={loadRoundHistory().length}
          />
        )}

        {activeTab === 'script' && (
          <ScriptPage
            script={getScript(activeScriptId)}
            onBack={() => setActiveTab('library')}
            onPrepare={() => setActiveTab('prepare')}
          />
        )}

        {activeTab === 'prepare' && (
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
