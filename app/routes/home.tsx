// app/routes/home.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpenIcon, CircleIcon } from 'lucide-react';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';

import type { Route } from "./+types/home";
import { CategoryCard } from '~/components/category-card';
import { getCategories, getCategoryWithQuestions } from '~/lib/supabase';
import { useQuizStore } from '~/lib/store';
import type { Category } from '~/types';
import { Button } from '~/components/ui/button';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NQESH Reviewer - Categories" },
    { name: "description", content: "Select a category to start your NQESH review" },
  ];
}

export default function Home() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  
  const { categories, setCategories, startQuiz, resetQuiz } = useQuizStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reset the quiz state when entering the home page
  useEffect(() => {
    resetQuiz();
  }, [resetQuiz]);
  
  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
        toast.error('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCategories();
  }, [setCategories]);
  
  const handleSelectCategory = async (categoryId: number) => {
    try {
      setIsLoading(true);
      const categoryWithQuestions = await getCategoryWithQuestions(categoryId);
      
      if (!categoryWithQuestions.questions.length) {
        toast.error('This category has no questions yet');
        setIsLoading(false);
        return;
      }
      
      startQuiz(categoryWithQuestions);
      navigate('/quiz');
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Failed to load quiz questions. Please try again later.');
      toast.error('Failed to load quiz questions');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">NQESH Reviewer</h1>
        <p className="text-sm text-muted-foreground">
          Select a category to start practicing for your National Qualifying Examination for School Heads
        </p>
      </div>
      
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-md bg-destructive/10 text-destructive-foreground">
          <p className="text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      )}
      
      <div className="mb-4 sm:mb-6 flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
        <CircleIcon className="size-2" />
        <span>Select a category below to begin the quiz</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {isLoading ? (
          // Skeleton loading placeholders
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-52 sm:h-64 rounded-lg border bg-card p-4 sm:p-6 shadow-sm animate-pulse">
              <div className="space-y-3 sm:space-y-4">
                <div className="h-6 sm:h-8 w-1/2 rounded-md bg-muted"></div>
                <div className="h-3 sm:h-4 w-3/4 rounded-md bg-muted"></div>
                <div className="h-12 sm:h-16 rounded-md bg-muted"></div>
                <div className="h-8 sm:h-10 rounded-md bg-muted"></div>
              </div>
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📚</div>
            <h3 className="text-lg sm:text-xl font-medium mb-2">No Categories Available</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              There are no categories available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onSelect={handleSelectCategory}
            />
          ))
        )}
      </div>
      
      <div className="flex justify-center mt-6 sm:mt-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <BookOpenIcon className="size-3 sm:size-4" />
          <span>Developed by Mark Anthony Llego</span>
        </div>
      </div>
    </div>
  );
}