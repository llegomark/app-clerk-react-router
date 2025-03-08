// app/routes/results.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';

import type { Route } from "./+types/results";
import { useQuizStore } from '~/lib/store';
import { ResultsCard } from '~/components/results-card';
import { logDebug, getCategoryWithQuestions } from '~/lib/supabase';

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
    resetQuiz,
    lastCategoryId
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
  
  // Try Again Function - Improved to handle both reusing existing category or fetching fresh
  const handleTryAgain = async () => {
    try {
      logDebug('Try Again clicked, restarting quiz with same category', { 
        categoryId: currentCategory.id,
        categoryName: currentCategory.name 
      });
      
      // Check if we have the complete category with questions
      if (currentCategory && currentCategory.questions && currentCategory.questions.length > 0) {
        // We have the complete category with questions, so use it directly
        startQuiz(currentCategory);
        navigate('/quiz');
      } else {
        // Something is wrong with the category, fetch it again
        toast.loading('Loading quiz questions...');
        const freshCategory = await getCategoryWithQuestions(currentCategory.id);
        toast.dismiss();
        startQuiz(freshCategory);
        navigate('/quiz');
      }
    } catch (error) {
      console.error('Error restarting quiz:', error);
      toast.error('Failed to restart quiz. Please try again.');
    }
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