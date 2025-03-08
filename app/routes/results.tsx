// app/routes/results.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react-router';

import type { Route } from "./+types/results";
import { useQuizStore } from '~/lib/store';
import { ResultsCard } from '~/components/results-card';
import { logDebug } from '~/lib/supabase';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NQESH Reviewer - Quiz Results" },
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
    return null; // This will prevent rendering before redirection happens
  }
  
  // Simply restart the same quiz with the current category
  const handleTryAgain = () => {
    logDebug('Try Again clicked, restarting quiz with same category', { 
      categoryId: currentCategory.id,
      categoryName: currentCategory.name 
    });
    
    // No need to fetch the category again, just use the current one
    startQuiz(currentCategory);
    navigate('/quiz');
  };
  
  const handleBackToCategories = () => {
    // Reset quiz and go back to categories
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