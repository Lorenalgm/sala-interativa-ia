import React, { useState } from 'react';
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

  const refreshData = () => {
    setClassroom(loadClassroom());
    setQuestions(loadQuestions());
    setHistory(loadQuestionHistory());
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200 text-base-content">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cameraActive={cameraActive}
      />

      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeDashboard
            onNavigate={setActiveTab}
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
            onNavigateToReports={() => setActiveTab('reports')}
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
