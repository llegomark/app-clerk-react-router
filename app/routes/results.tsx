// app/routes/results.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Medal, AlertCircle, BarChart } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ProtectedRoute } from '~/components/protected-route';
import { useQuizStore } from '~/lib/store';
import type { QuizResult } from '~/types';

export function meta() {
    return [
        { title: "NQESH Reviewer Pro - Quiz Results" },
        { name: "description", content: "View your quiz results" },
    ];
}

export default function ResultsPage() {
    return (
        <ProtectedRoute>
            <ResultsContent />
        </ProtectedRoute>
    );
}

function ResultsContent() {
    const navigate = useNavigate();
    const { resetQuiz, currentCategory } = useQuizStore();
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try to get results from session storage
        try {
            const storedResults = sessionStorage.getItem('lastQuizResult');
            if (storedResults) {
                setQuizResult(JSON.parse(storedResults));
            } else if (currentCategory) {
                // If we have current category in store but no session data
                console.warn('No stored quiz results found, but currentCategory exists');
            } else {
                // No results and no current category means user navigated here directly
                console.warn('No quiz results found, redirecting to home');
                navigate('/', { replace: true });
            }
        } catch (error) {
            console.error('Error loading quiz results', error);
        } finally {
            setLoading(false);
        }
    }, [navigate, currentCategory]);

    const handleBackToCategories = () => {
        resetQuiz();
        // Clean up session storage
        sessionStorage.removeItem('lastQuizResult');
        navigate('/', { replace: true });
    };

    const handleViewDashboard = () => {
        resetQuiz();
        navigate('/dashboard', { replace: true });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (!quizResult) {
        return (
            <div className="container max-w-2xl mx-auto px-4 py-12">
                <Card>
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            <div className="bg-destructive/10 p-3 rounded-full">
                                <AlertCircle className="size-8 text-destructive" />
                            </div>
                        </div>
                        <CardTitle className="text-center">No Results Found</CardTitle>
                        <CardDescription className="text-center">
                            We couldn't find any quiz results. You may need to complete a quiz first.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button onClick={handleBackToCategories}>
                            <ArrowLeft className="mr-2 size-4" /> Return to Categories
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { score, totalQuestions } = quizResult;
    const percentage = Math.round((score / totalQuestions) * 100);
    const isPassing = percentage >= 70; // assuming 70% is passing

    // Calculate a score message based on percentage
    let scoreMessage = '';
    if (percentage >= 90) {
        scoreMessage = 'Excellent! You have mastered this topic!';
    } else if (percentage >= 80) {
        scoreMessage = 'Great job! You have a strong understanding of this material.';
    } else if (percentage >= 70) {
        scoreMessage = 'Good work! You have a solid grasp of the fundamentals.';
    } else if (percentage >= 60) {
        scoreMessage = 'Keep practicing! You\'re on the right track.';
    } else {
        scoreMessage = 'This topic needs more review. Don\'t give up!';
    }

    return (
        <div className="container max-w-2xl mx-auto px-4 py-12">
            <Card>
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className={`p-3 rounded-full ${isPassing ? 'bg-primary/10' : 'bg-orange-500/10'}`}>
                            <Medal className={`size-8 ${isPassing ? 'text-primary' : 'text-orange-500'}`} />
                        </div>
                    </div>
                    <CardTitle className="text-center text-2xl sm:text-3xl">{percentage}%</CardTitle>
                    <CardDescription className="text-center text-base mt-2">{scoreMessage}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center mb-6">
                        <p className="text-lg font-medium">You scored {score} out of {totalQuestions} questions</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {new Date(quizResult.completedAt).toLocaleDateString()} at {new Date(quizResult.completedAt).toLocaleTimeString()}
                        </p>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <Button variant="default" onClick={handleBackToCategories}>
                            <ArrowLeft className="mr-2 size-4" /> Practice More
                        </Button>

                        <Button variant="outline" onClick={handleViewDashboard}>
                            <BarChart className="mr-2 size-4" /> View Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}