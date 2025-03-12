// app/routes/home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';
import { FolderIcon, GraduationCapIcon, BookOpenIcon, BarChart4Icon } from 'lucide-react';

import type { Route } from "./+types/home";
import { CategoryCard } from '~/components/category-card';
import { useCategories } from '~/hooks/use-categories';
import { useQuizStore } from '~/lib/store';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { getCategoryWithQuestions, logDebug } from '~/lib/supabase';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "NQESH Reviewer Pro - Categories" },
    { name: "description", content: "Select a category to start your NQESH review" },
  ];
}

export default function Home() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  const {
    startQuiz,
    resetQuiz
  } = useQuizStore();

  const [loadingCategoryId, setLoadingCategoryId] = useState<number | null>(null);

  // Use TanStack Query for fetching categories
  const {
    data: categories = [],
    isPending,
    error,
    refetch
  } = useCategories();

  // Reset state on mount
  useEffect(() => {
    resetQuiz();
  }, [resetQuiz]);

  // Directly handle category selection without using the useCategoryWithQuestions hook
  const handleSelectCategory = async (categoryId: number) => {
    if (loadingCategoryId !== null) return; // Prevent multiple selections

    try {
      console.log(`Selecting category ${categoryId}`);
      setLoadingCategoryId(categoryId);

      // Reset quiz state
      resetQuiz();

      // Directly fetch category data from supabase
      logDebug(`Direct fetching for category ${categoryId}`);
      const categoryData = await getCategoryWithQuestions(categoryId);

      console.log('Category data loaded directly:', categoryData);

      if (!categoryData) {
        toast.error('Failed to load category details');
        return;
      }

      if (!categoryData.questions || categoryData.questions.length === 0) {
        toast.error('This category has no questions yet');
        return;
      }

      // Start the quiz
      startQuiz(categoryData);

      // Navigate to reviewer page
      navigate('/reviewer');
    } catch (err) {
      console.error('Error in handleSelectCategory:', err);
      toast.error('Failed to load review questions. Please try again later.');
    } finally {
      setLoadingCategoryId(null);
    }
  };

  // Render study tools skeleton loading UI
  const renderStudyToolsSkeletons = () => (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 rounded-lg border bg-card p-4 shadow-xs animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 rounded-md bg-muted"></div>
              <div className="h-3 w-32 rounded-md bg-muted"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render actual study tools
  const renderStudyTools = () => (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
      <Card
        className="border-muted bg-card/50 transition-all hover:border-primary/40 hover:bg-accent/10 hover:shadow-md cursor-pointer"
        onClick={() => navigate('/deped-orders')}
      >
        <CardContent className="p-5 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <GraduationCapIcon className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">DepEd Orders</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Browse and reference official DepEd issuances
            </p>
          </div>
        </CardContent>
      </Card>

      <Card
        className="border-muted bg-card/50 transition-all hover:border-primary/40 hover:bg-accent/10 hover:shadow-md cursor-pointer"
        onClick={() => navigate('/flashcards')}
      >
        <CardContent className="p-5 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <BookOpenIcon className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Flash Cards</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Learn key NQESH terms and definitions
            </p>
          </div>
        </CardContent>
      </Card>

      <Card
        className="border-muted bg-card/50 transition-all hover:border-primary/40 hover:bg-accent/10 hover:shadow-md cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <CardContent className="p-5 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <BarChart4Icon className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Dashboard</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Track your progress and performance
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
      <div className="mb-6 sm:mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <GraduationCapIcon className="size-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">NQESH Reviewer Pro</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Master essential leadership competencies for your school administrator's journey. Select a category below to start practicing.
        </p>
      </div>

      {/* Study Tools Section - Conditional Skeleton Loading */}
      {isPending ? renderStudyToolsSkeletons() : renderStudyTools()}

      {error && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-md bg-destructive/10 text-destructive-foreground max-w-lg mx-auto">
          <p className="text-sm text-center mb-3">{error instanceof Error ? error.message : 'Failed to load categories'}</p>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      <h2 className="text-lg font-medium mb-4">Topic Categories</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {isPending ? (
          // Skeleton loading placeholders
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 sm:h-56 rounded-lg border bg-card p-4 sm:p-6 shadow-xs animate-pulse">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between">
                  <div className="h-6 w-6 rounded-md bg-muted"></div>
                  <div className="h-4 w-4 rounded-md bg-muted"></div>
                </div>
                <div className="h-5 sm:h-6 w-1/2 rounded-md bg-muted"></div>
                <div className="h-3 sm:h-4 w-3/4 rounded-md bg-muted"></div>
                <div className="h-12 sm:h-14 rounded-md bg-muted"></div>
                <div className="h-4 w-28 rounded-md bg-muted mt-2"></div>
              </div>
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <FolderIcon className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium mb-2">No Categories Available</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              There are no review categories available at the moment. Please check back later.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
            >
              Refresh Categories
            </Button>
          </div>
        ) : (
          categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onSelect={handleSelectCategory}  // This should directly call our handler
              isLoading={loadingCategoryId === category.id}
            />
          ))
        )}
      </div>

      {/* Debug button to test category selection directly - can be removed in production */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">If category selection isn't working, try the debug button:</p>
          <Button
            variant="outline"
            onClick={() => {
              // Pick the first category if available
              if (categories && categories.length > 0) {
                handleSelectCategory(categories[0].id);
              } else {
                toast.error('No categories available to select');
              }
            }}
          >
            Debug: Select First Category
          </Button>
        </div>
      )}
    </div>
  );
}