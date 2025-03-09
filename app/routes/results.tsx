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
import { logDebug, getCategoryWithQuestions, getRecentQuizResults, logError } from '~/lib/supabase';
import type { RecentQuizResult, Question } from '~/types';
import { ProtectedRoute } from '~/components/protected-route'; // Import the ProtectedRoute component
import { useBookmarkService } from '~/lib/bookmark-service';
import type { Database } from '~/lib/supabase-types';
import { supabase } from '~/lib/supabase';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "NQESH Reviewer Pro - Quiz Results" },
        { name: "description", content: "View your NQESH practice quiz results" },
    ];
}

export default function Results() {
    // Wrap the component with ProtectedRoute to ensure authentication
    return (
        <ProtectedRoute>
            <ResultsContent />
        </ProtectedRoute>
    );
}

type BookmarkedQuestion = Database['public']['Tables']['bookmarked_questions']['Row'];

// Function to properly reconstruct a complete Question object from the bookmark data
function reconstructQuestion(bookmark: BookmarkedQuestion): Question {
    // Check if we have the full question_data JSON
    if (bookmark.question_data) {
        try {
            // Parse the question data if it's a string
            const questionData = typeof bookmark.question_data === 'string'
                ? JSON.parse(bookmark.question_data)
                : bookmark.question_data;

            // Combine the data into a complete Question object
            return {
                id: bookmark.question_id,
                question: bookmark.question_text,
                options: questionData.options || ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: questionData.correctAnswer || 0,
                explanation: questionData.explanation || 'No explanation available',
                reference: questionData.reference || undefined
            };
        } catch (e) {
            console.error('Error parsing question data:', e);
        }
    }

    // If no complete data is available or there was an error parsing it,
    // return a basic Question object with placeholders
    return {
        id: bookmark.question_id,
        question: bookmark.question_text,
        options: ['Option A', 'Option B', 'Option C', 'Option D'], // Placeholder options
        correctAnswer: 0, // Default to first option
        explanation: 'No explanation available',
    };
}

// Separate the content into its own component
function ResultsContent() {
    const navigate = useNavigate();
    const { user } = useUser();
    // Important: Call hooks at the top level of the component
    const bookmarkService = useBookmarkService();

    const {
        currentCategory,
        userAnswers,
        getScore,
        isQuizComplete,
        startQuiz,
        resetQuiz
    } = useQuizStore();

    const [previousResults, setPreviousResults] = useState<RecentQuizResult[]>([]);
    const [totalQuizCount, setTotalQuizCount] = useState(0);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        // If no category is selected or quiz is not complete, redirect to home
        if (!currentCategory || !isQuizComplete) {
            navigate('/');
            return;
        }

        // Fetch previous quiz results for the user
        const fetchPreviousResults = async () => {
            if (!user) return;

            try {
                setIsLoadingHistory(true);
                const userId = user.id;
                const { results, totalCount } = await getRecentQuizResults(userId, 10); // Get last 10 results
                setPreviousResults(results);
                setTotalQuizCount(totalCount);
            } catch (error) {
                console.error('Error fetching previous results:', error);
                // We won't show a toast here to keep the UI clean - the chart just won't appear
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchPreviousResults();
    }, [currentCategory, isQuizComplete, navigate, user]);

    // If we don't have a category or the quiz isn't complete, return null
    // The redirect is handled in the useEffect
    if (!currentCategory || !isQuizComplete) {
        return null;
    }

    // Try Again Function - Properly restarting the quiz
    const handleTryAgain = async () => {
        try {
            // Check if this was a bookmarked quiz
            const isBookmarkedQuiz = currentCategory.id === -999 ||
                (currentCategory as any).isBookmarkedQuiz === true;

            if (isBookmarkedQuiz) {
                // Handle retry for bookmarked questions
                console.log('Restarting bookmarked questions quiz');

                // First, reset the state
                resetQuiz();

                // Get the bookmark IDs from the category if available
                let bookmarkIds: number[] = [];

                if ((currentCategory as any).bookmarkIds) {
                    // Use IDs stored in the category object
                    bookmarkIds = (currentCategory as any).bookmarkIds;
                } else {
                    // Try to get IDs from localStorage as fallback
                    try {
                        const storedIds = localStorage.getItem('lastBookmarkedQuizIds');
                        if (storedIds) {
                            bookmarkIds = JSON.parse(storedIds);
                        }
                    } catch (e) {
                        console.error('Error retrieving bookmark IDs:', e);
                    }
                }

                if (bookmarkIds.length === 0) {
                    // If we can't get the IDs, we can't restart the quiz
                    toast.error('Could not restart the bookmarked quiz. Returning to bookmarks page.');
                    navigate('/bookmarks');
                    return;
                }

                toast.loading('Loading quiz...');

                // Get the bookmarks using the IDs
                try {
                    // Use the bookmarkService from the top level of the component
                    const { bookmarks, error } = await bookmarkService.getBookmarkedQuestions();

                    if (error) throw error;

                    // Filter to only include the ones used in the original quiz
                    const relevantBookmarks = bookmarks.filter(b => bookmarkIds.includes(b.id));

                    if (relevantBookmarks.length === 0) {
                        throw new Error('No bookmarks found with the saved IDs');
                    }

                    // Create complete questions from bookmarks
                    const questions: Question[] = relevantBookmarks.map(bookmark =>
                        reconstructQuestion(bookmark)
                    );

                    // Create a custom category
                    const bookmarkedCategory = {
                        id: -999,
                        name: 'Bookmarked Questions',
                        description: `A custom quiz with ${questions.length} bookmarked questions`,
                        icon: '🔖',
                        questions: questions,
                        isBookmarkedQuiz: true,
                        bookmarkIds: bookmarkIds
                    };

                    // Start the quiz with this category
                    startQuiz(bookmarkedCategory);

                    // Navigate to quiz page
                    toast.dismiss();
                    navigate('/reviewer');
                } catch (error) {
                    console.error('Error loading bookmarks:', error);
                    toast.error('Failed to load bookmarked questions');
                    navigate('/bookmarks');
                }
            } else {
                // This is a regular category quiz, use the original approach
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
            }
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

            {/* Charts and metrics section */}
            <div className="mt-6 space-y-6">
                {/* Progress over time chart - only show if we have previous results */}
                {previousResults.length > 0 && (
                    <UserProgressChart
                        results={[
                            // Include the current result with previous ones
                            {
                                id: new Date().getTime(), // Use timestamp for unique ID
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
                        totalQuizCount={totalQuizCount}
                    />
                    <QuestionBreakdownChart
                        userAnswers={userAnswers}
                        totalQuestions={totalQuestions}
                    />
                </div>
            </div>
        </div>
    );
}