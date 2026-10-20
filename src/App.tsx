import React, { useEffect, useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomeDashboard } from './components/Home/HomeDashboard';
import { QuestionFlow } from './components/QuestionsMode/QuestionFlow';
import { ExerciseFlow } from './components/ExercisesMode/ExerciseFlow';
import { CardPrintView } from './components/CardGenerator/CardPrintView';
import { ClassroomManager } from './components/Classroom/ClassroomManager';
import { PerformanceSummary } from './components/Reports/PerformanceSummary';
import { defaultExercises } from './data/defaultExercises';
import {
  loadClassroom,
  loadQuestionHistory,
  loadQuestions,
} from './services/storageService';
import { Classroom, Question, QuestionSessionRecord } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
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
        {activeTab === 'home' && (
          <HomeDashboard
            onNavigate={handleSelectTab}
            studentsCount={classroom.students.length}
            questionsCount={questions.length}
            exercisesCount={defaultExercises.length}
            completedSessionsCount={history.length}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionFlow
            questions={questions}
            students={classroom.students}
            onRefreshQuestions={refreshData}
            onSessionComplete={refreshData}
            onCameraStatusChange={setCameraActive}
            onNavigateToReports={() => handleSelectTab('reports')}
            onRoundProgressChange={setIsRoundInProgress}
          />
        )}

        {activeTab === 'exercises' && (
          <ExerciseFlow
            exercises={defaultExercises}
            onCameraStatusChange={setCameraActive}
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

      <footer className="no-print border-t border-base-300 bg-base-100 py-6 px-6 text-center text-sm text-base-content/70">
        <p>
          ClassPlay. A visão computacional roda em tempo real no navegador do professor.
        </p>
      </footer>
    </div>
  );
};

export default App;
