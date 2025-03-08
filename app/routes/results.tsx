// app/routes/results.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';

import type { Route } from "./+types/results";
import { useQuizStore } from '~/lib/store';
import { ResultsCard } from '~/components/results-card';
import { logDebug, getCategoryWithQuestions, getRecentQuizResults } from '~/lib/supabase';
import { UserProgressChart } from '~/components/user-progress-chart';
import type { RecentQuizResult } from '~/types';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NQESH Reviewer Pro - Quiz Results" },
    { name: "description", content: "View your NQESH practice quiz results" },
  ];
}

export default function Results() {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  
  const { 
    currentCategory, 
    userAnswers, 
    getScore, 
    isQuizComplete,
    startQuiz,
    resetQuiz
  } = useQuizStore();
  
  const [previousResults, setPreviousResults] = useState<RecentQuizResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  useEffect(() => {
    // If no category is selected or quiz is not complete, redirect to home
    if (!currentCategory || !isQuizComplete) {
      navigate('/');
      return;
    }
    
    // Fetch previous quiz results for the user
    const fetchPreviousResults = async () => {
      if (!isSignedIn || !user) return;
      
      try {
        setIsLoadingHistory(true);
        const userId = user.id;
        const results = await getRecentQuizResults(userId, 10); // Get last 10 results
        setPreviousResults(results);
      } catch (error) {
        console.error('Error fetching previous results:', error);
        // We won't show a toast here to keep the UI clean - the chart just won't appear
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    fetchPreviousResults();
  }, [currentCategory, isQuizComplete, navigate, user, isSignedIn]);
  
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
      
      {/* Only show the progress chart if the user is signed in and we have results */}
      {isSignedIn && previousResults.length > 0 && (
        <UserProgressChart 
          results={previousResults}
          currentCategoryId={currentCategory.id}
        />
      )}
    </div>
  );
}