// app/routes/results.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import type { Route } from "./+types/results";
import { useQuizStore } from '~/lib/store';
import { ResultsCard } from '~/components/results-card';
import { logDebug } from '~/lib/supabase';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NQESH Reviewer Pro - Quiz Results" },
    { name: "description", content: "View your NQESH practice quiz results" },
  ];
}

export default function Results() {
  const navigate = useNavigate();
  
  const { 
    currentCategory, 
    userAnswers, 
    getScore, 
    isQuizComplete,
    startQuiz,
    resetQuiz
  } = useQuizStore();
  
  useEffect(() => {
    // If no category is selected or quiz is not complete, redirect to home
    if (!currentCategory || !isQuizComplete) {
      navigate('/');
    }
  }, [currentCategory, isQuizComplete, navigate]);
  
  if (!currentCategory || !isQuizComplete) {
    return null;
  }
  
  // Completely rewritten Try Again function
  const handleTryAgain = () => {
    try {
      logDebug('Try Again button clicked, restarting quiz with same category', { 
        categoryId: currentCategory.id,
        categoryName: currentCategory.name,
        hasQuestions: currentCategory.questions?.length
      });
      
      // Get a copy of the current category before resetting
      const categoryToRestart = {...currentCategory};
      
      // Directly start a new quiz with this category (this will handle the reset internally)
      startQuiz(categoryToRestart);
      
      // Navigate to quiz page (must be after startQuiz)
      navigate('/quiz', { replace: true });
    } catch (error) {
      console.error('Error restarting quiz:', error);
      toast.error('Failed to restart quiz. Please try again.');
    }
  };
  
  const handleBackToCategories = () => {
    resetQuiz();
    navigate('/');
  };

  return (
    <div className="container mx-auto py-4 px-4 max-w-4xl">
      <ResultsCard
        category={currentCategory}
        userAnswers={userAnswers}
        score={getScore()}
        onTryAgain={handleTryAgain}
        onBackToCategories={handleBackToCategories}
      />
    </div>
  );
}