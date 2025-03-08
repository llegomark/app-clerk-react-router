// app/routes/quiz.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';

import type { Route } from "./+types/quiz";
import { useQuizStore } from '~/lib/store';
import { QuestionCard } from '~/components/question-card';
import { QuizHeader } from '~/components/quiz-header';
import { saveQuizResult, logDebug, logError, getCategoryWithQuestions } from '~/lib/supabase';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NQESH Reviewer Pro - Quiz" },
    { name: "description", content: "Test your knowledge with NQESH practice questions" },
  ];
}

export default function Quiz() {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  
  const { 
    currentCategory,
    lastCategoryId,
    currentQuestionIndex,
    userAnswers,
    answerQuestion,
    nextQuestion,
    completeQuiz,
    getCurrentQuestion,
    getUserAnswerForCurrentQuestion,
    isTimerRunning,
    stopTimer,
    isQuizComplete,
    getScore,
    resetQuiz,
    startQuiz
  } = useQuizStore();
  
  useEffect(() => {
    // If the quiz state is missing, attempt to use lastCategoryId to recover
    if (!currentCategory && lastCategoryId) {
      // Try to recover by fetching the category again
      const recoverQuiz = async () => {
        try {
          logDebug('Attempting to recover quiz with lastCategoryId', { lastCategoryId });
          const recoveredCategory = await getCategoryWithQuestions(lastCategoryId);
          startQuiz(recoveredCategory);
        } catch (error) {
          logError('Failed to recover quiz', error);
          // If recovery fails, redirect to home
          toast.error('Could not load the quiz. Returning to home page.');
          navigate('/');
        }
      };
      
      recoverQuiz();
      return;
    } else if (!currentCategory) {
      // No category and no lastCategoryId means we can't recover, go to home
      logDebug('No quiz data available, redirecting to home');
      navigate('/');
      return;
    }
    
    // If quiz is complete, save results and redirect to results page
    if (isQuizComplete && currentCategory) {  // Added null check here
      const saveResults = async () => {
        try {
          logDebug('Quiz completed, preparing to save results', {
            categoryId: currentCategory.id,
            score: getScore(),
            totalQuestions: currentCategory.questions.length
          });
          
          // Prepare the quiz result data
          const resultData = {
            categoryId: currentCategory.id,
            answers: userAnswers,
            score: getScore(),
            totalQuestions: currentCategory.questions.length,
            completedAt: new Date()
          };
          
          // Save quiz results to Supabase
          const userId = isSignedIn && user ? user.id : 'anonymous';
          const result = await saveQuizResult(userId, resultData);
          
          if (result.success) {
            toast.success('Results saved');
            logDebug('Results saved successfully');
          } else {
            logError('Failed to save results', result.error);
            toast.error('Could not save results, but you can still see your score');
          }
        } catch (error) {
          logError('Error in saveResults function', error);
          toast.error('Could not save results, but you can still see your score');
        } finally {
          // Navigate to results page regardless of save success
          navigate('/results');
        }
      };
      
      saveResults();
    }
  }, [currentCategory, isQuizComplete, navigate, user, isSignedIn, userAnswers, getScore, lastCategoryId, startQuiz]);
  
  if (!currentCategory) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading quiz...</p>
      </div>
    );
  }
  
  const currentQuestion = getCurrentQuestion();
  const userAnswer = getUserAnswerForCurrentQuestion();
  
  if (!currentQuestion) {
    completeQuiz();
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Preparing results...</p>
      </div>
    );
  }
  
  const handleBackToCategories = () => {
    resetQuiz();
    navigate('/');
  };
  
  const handleAnswerQuestion = (selectedOption: number) => {
    // This would normally come from the timer component
    // For now, just use a fixed value for the remaining time
    const timeRemaining = 100; 
    answerQuestion(currentQuestion.id, selectedOption, timeRemaining);
  };
  
  const handleTimeUp = () => {
    answerQuestion(currentQuestion.id, null, 0);
    stopTimer();
    toast.warning('Time\'s up!');
  };
  
  const handleNextQuestion = () => {
    if (!currentCategory) return; // Added null check
    
    const isLastQuestion = currentQuestionIndex === currentCategory.questions.length - 1;
    
    if (isLastQuestion) {
      completeQuiz();
    } else {
      nextQuestion();
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 max-w-4xl">
      <QuizHeader 
        title={currentCategory.name} 
        onExit={handleBackToCategories} 
      />
      
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={currentCategory.questions.length}
        userAnswer={userAnswer}
        isTimerRunning={isTimerRunning}
        onAnswer={handleAnswerQuestion}
        onTimeUp={handleTimeUp}
        onNext={handleNextQuestion}
      />
    </div>
  );
}