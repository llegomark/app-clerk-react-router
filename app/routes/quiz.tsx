// app/routes/quiz.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';

import type { Route } from "./+types/quiz";
import { useQuizStore } from '~/lib/store';
import { QuestionCard } from '~/components/question-card';
import { QuizHeader } from '~/components/quiz-header';
import { saveQuizResult, logDebug, logError } from '~/lib/supabase';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NQESH Reviewer - Quiz" },
    { name: "description", content: "Test your knowledge with NQESH practice questions" },
  ];
}

export default function Quiz() {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  
  const { 
    currentCategory,
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
    resetQuiz
  } = useQuizStore();
  
  useEffect(() => {
    // If no category is selected, redirect to home
    if (!currentCategory) {
      navigate('/');
      return;
    }
    
    // If quiz is complete, save results and redirect to results page
    if (isQuizComplete) {
      const saveResults = async () => {
        if (isSignedIn && user) {
          try {
            logDebug('Quiz completed, saving results', {
              categoryId: currentCategory.id,
              userId: user.id,
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
            await saveQuizResult(user.id, resultData);
            toast.success('Results saved');
          } catch (error) {
            logError('Error saving quiz results', error);
            toast.error('Could not save results, but you can still see your score');
          }
        } else {
          logDebug('User not signed in, skipping result save');
        }
        
        // Navigate to results page regardless of save success
        navigate('/results');
      };
      
      saveResults();
    }
  }, [currentCategory, isQuizComplete, navigate, user, isSignedIn, userAnswers, getScore]);
  
  if (!currentCategory) {
    return null;
  }
  
  const currentQuestion = getCurrentQuestion();
  const userAnswer = getUserAnswerForCurrentQuestion();
  
  if (!currentQuestion) {
    completeQuiz();
    return null;
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