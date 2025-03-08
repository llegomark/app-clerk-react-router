// app/routes/results.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import type { Route } from "./+types/results";
import { useQuizStore } from '~/lib/store';
import { ResultsCard } from '~/components/results-card';
import { logDebug, getCategoryWithQuestions } from '~/lib/supabase';

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
  
  // Try Again Function - Properly restarting the quiz
  const handleTryAgain = async () => {
    try {
      // Need to store these values before reset
      const categoryId = currentCategory.id;
      const categoryName = currentCategory.name;
      
      logDebug('Try Again button clicked, restarting quiz with category', { 
        categoryId, 
        categoryName
      });
      
      // First, reset the state
      resetQuiz();
      
      // Then get fresh data for the category
      toast.loading('Loading quiz...');
      const freshCategory = await getCategoryWithQuestions(categoryId);
      toast.dismiss();
      
      if (!freshCategory || !freshCategory.questions || freshCategory.questions.length === 0) {
        toast.error('Could not restart the quiz. Please try again.');
        navigate('/');
        return;
      }
      
      // Start the quiz with fresh data
      startQuiz(freshCategory);
      
      // Navigate to quiz page
      navigate('/quiz');
    } catch (error) {
      console.error('Error restarting quiz:', error);
      toast.error('Failed to restart quiz. Please try again.');
      navigate('/');
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