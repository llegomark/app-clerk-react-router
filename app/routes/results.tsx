// app/routes/results.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';

import type { Route } from "./+types/results";
import { useQuizStore } from '~/lib/store';
import { ResultsCard } from '~/components/results-card';
import { UserProgressChart } from '~/components/user-progress-chart';
import { PerformanceMetrics } from '~/components/performance-metrics';
import { QuestionBreakdownChart } from '~/components/question-breakdown-chart';
import { logDebug, getCategoryWithQuestions, getRecentQuizResults } from '~/lib/supabase';
import type { RecentQuizResult } from '~/types';

export function meta({ }: Route.MetaArgs) {
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
            navigate('/reviewer');
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

    // Current quiz score and other stats
    const score = getScore();
    const totalQuestions = currentCategory.questions.length;

    return (
        <div className="container mx-auto py-4 px-4 max-w-4xl">
            <ResultsCard
                category={currentCategory}
                userAnswers={userAnswers}
                score={score}
                onTryAgain={handleTryAgain}
                onBackToCategories={handleBackToCategories}
            />

            {/* Charts and metrics section - only show for signed in users */}
            {isSignedIn && (
                <div className="mt-6 space-y-6">
                    {/* Progress over time chart - only show if we have previous results */}
                    {previousResults.length > 0 && (
                        <UserProgressChart
                            results={[
                                // Include the current result with previous ones
                                {
                                    id: 0, // Temporary ID
                                    categoryId: currentCategory.id,
                                    categoryName: currentCategory.name,
                                    score: score,
                                    totalQuestions: totalQuestions,
                                    completedAt: new Date().toISOString()
                                },
                                ...previousResults
                            ]}
                            currentCategoryId={currentCategory.id}
                        />
                    )}

                    {/* Stats and breakdown in a grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PerformanceMetrics
                            allResults={previousResults}
                            currentResult={{
                                score: score,
                                totalQuestions: totalQuestions
                            }}
                        />
                        <QuestionBreakdownChart
                            userAnswers={userAnswers}
                            totalQuestions={totalQuestions}
                        />
                    </div>
                </div>
            )}

            {/* Message for anonymous users */}
            {!isSignedIn && (
                <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>Sign in to track your progress over time and see detailed analytics.</p>
                </div>
            )}
        </div>
    );
}