// app/routes/quiz.tsx - fixed version
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';

import type { Route } from "./+types/quiz";
import { useQuizStore } from '~/lib/store';
import { QuizHeader } from '~/components/quiz-header';
import { QuestionCard } from '~/components/question-card';
import { logDebug, logError } from '~/lib/supabase';
import { ProtectedRoute } from '~/components/protected-route';
import { useSaveQuizResult } from '~/hooks/use-quiz-mutations';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "NQESH Reviewer Pro" },
        { name: "description", content: "Test your knowledge with NQESH practice questions" },
    ];
}

export default function Reviewer() {
    return (
        <ProtectedRoute>
            <ReviewerContent />
        </ProtectedRoute>
    );
}

function ReviewerContent() {
    const navigate = useNavigate();
    const { user } = useUser();
    const saveQuizResultMutation = useSaveQuizResult();
    const resultsSaved = useRef(false);

    const {
        currentCategory,
        currentQuestionIndex,
        userAnswers,
        answerQuestion,
        nextQuestion,
        completeQuiz,
        getCurrentQuestion,
        getUserAnswerForCurrentQuestion,
        isTimerRunning,
        stopTimer,
        isQuizComplete,
        getScore,
        resetQuiz
    } = useQuizStore();

    useEffect(() => {
        // If no category is selected, redirect to home
        if (!currentCategory) {
            navigate('/', { replace: true });
            return;
        }

        // If quiz is complete and results haven't been saved yet, save them
        if (isQuizComplete && currentCategory && !resultsSaved.current) {
            const saveResults = async () => {
                try {
                    // Set flag to prevent multiple saves
                    resultsSaved.current = true;

                    logDebug('Review completed, preparing to save results', {
                        categoryId: currentCategory.id,
                        score: getScore(),
                        totalQuestions: currentCategory.questions.length
                    });

                    // Prepare the quiz result data
                    const resultData = {
                        categoryId: currentCategory.id,
                        answers: userAnswers,
                        score: getScore(),
                        totalQuestions: currentCategory.questions.length,
                        completedAt: new Date()
                    };

                    if (!user?.id) {
                        console.error('User ID is missing, cannot save results');
                        toast.error('Could not save results, but you can still see your score');
                        // Store results in session storage for viewing
                        sessionStorage.setItem('lastQuizResult', JSON.stringify(resultData));
                        navigate('/results', { replace: true });
                        return;
                    }

                    // Use mutation to save quiz results with TanStack Query
                    await saveQuizResultMutation.mutateAsync(
                        {
                            userId: user.id,
                            resultData
                        }
                    );

                    // Store results in session storage for the results page
                    sessionStorage.setItem('lastQuizResult', JSON.stringify(resultData));

                    // Navigate using a timeout to prevent routing race conditions
                    setTimeout(() => {
                        navigate('/results', { replace: true });
                    }, 100);

                } catch (error) {
                    logError('Error in saveResults function', error);
                    toast.error('Could not save results, but you can still see your score');

                    // Store results in session storage for viewing
                    if (currentCategory) {
                        sessionStorage.setItem('lastQuizResult', JSON.stringify({
                            categoryId: currentCategory.id,
                            answers: userAnswers,
                            score: getScore(),
                            totalQuestions: currentCategory.questions.length,
                            completedAt: new Date()
                        }));
                    }

                    setTimeout(() => {
                        navigate('/results', { replace: true });
                    }, 100);
                }
            };

            saveResults();
        }
    }, [currentCategory, isQuizComplete, navigate, user, userAnswers, getScore, saveQuizResultMutation]);

    // Cleanup effect for when component unmounts
    useEffect(() => {
        return () => {
            // Reset saved flag when component unmounts
            resultsSaved.current = false;
        };
    }, []);

    if (!currentCategory) {
        return null; // Redirect is handled in useEffect
    }

    const currentQuestion = getCurrentQuestion();
    const userAnswer = getUserAnswerForCurrentQuestion();

    if (!currentQuestion) {
        // Only complete quiz if it's not already complete
        if (!isQuizComplete) {
            completeQuiz();
        }

        return (
            <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center">
                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <p className="mt-3 text-xs text-muted-foreground">Preparing results...</p>
            </div>
        );
    }

    // Exit handler - this needs to properly reset state and navigate
    const handleBackToCategories = () => {
        resetQuiz();
        navigate('/', { replace: true });
    };

    // Updated to accept timeRemaining parameter
    const handleAnswerQuestion = (selectedOption: number, timeRemaining: number) => {
        // Now using the actual time remaining passed from the Timer component via QuestionCard
        answerQuestion(currentQuestion.id, selectedOption, timeRemaining);
    };

    const handleTimeUp = () => {
        // When time is up, pass 0 as the timeRemaining
        answerQuestion(currentQuestion.id, null, 0);
        stopTimer();
    };

    const handleNextQuestion = () => {
        if (!currentCategory) return;

        const isLastQuestion = currentQuestionIndex === currentCategory.questions.length - 1;

        if (isLastQuestion) {
            completeQuiz();
        } else {
            nextQuestion();
        }
    };

    return (
        <div className="min-h-[calc(100vh-10rem)] bg-background py-10 px-4">
            <QuizHeader title={currentCategory.name} />
            <QuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={currentCategory.questions.length}
                userAnswer={userAnswer}
                isTimerRunning={isTimerRunning}
                categoryId={currentCategory.id}
                categoryName={currentCategory.name}
                onAnswer={handleAnswerQuestion}
                onTimeUp={handleTimeUp}
                onNext={handleNextQuestion}
                onExit={handleBackToCategories}
            />
        </div>
    );
}