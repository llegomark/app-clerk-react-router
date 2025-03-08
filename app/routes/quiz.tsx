// app/routes/quiz.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';

import type { Route } from "./+types/quiz";
import { useQuizStore } from '~/lib/store';
import { QuestionCard } from '~/components/question-card';
import { QuizHeader } from '~/components/quiz-header';
import { saveQuizResult, logDebug, logError } from '~/lib/supabase';
import { SignInPrompt } from '~/components/sign-in-prompt';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "NQESH Reviewer Pro" },
        { name: "description", content: "Test your knowledge with NQESH practice questions" },
    ];
}

export default function Reviewer() {
    const navigate = useNavigate();
    const { user, isSignedIn, isLoaded } = useUser();

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

        // If quiz is complete, save results and redirect to results page
        if (isQuizComplete && currentCategory) {
            const saveResults = async () => {
                try {
                    // Only proceed if user is authenticated
                    if (!isSignedIn || !user) {
                        navigate('/results', { replace: true });
                        return;
                    }

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

                    // Save quiz results to Supabase
                    const userId = user.id;
                    const result = await saveQuizResult(userId, resultData);

                    if (result.success) {
                        // Remove success toast, only log the success
                        logDebug('Results saved successfully');
                    } else {
                        logError('Failed to save results', result.error);
                        toast.error('Could not save results, but you can still see your score');
                    }
                } catch (error) {
                    logError('Error in saveResults function', error);
                    toast.error('Could not save results, but you can still see your score');
                } finally {
                    // Navigate to results page regardless of save success
                    navigate('/results', { replace: true });
                }
            };

            saveResults();
        }
    }, [currentCategory, isQuizComplete, navigate, user, isSignedIn, userAnswers, getScore]);

    // Show loading state while checking auth
    if (!isLoaded) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center">
                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <p className="mt-3 text-xs text-muted-foreground">Loading...</p>
            </div>
        );
    }

    // Require authentication
    if (!isSignedIn) {
        return <SignInPrompt />;
    }

    if (!currentCategory) {
        return null; // Redirect is handled in useEffect
    }

    const currentQuestion = getCurrentQuestion();
    const userAnswer = getUserAnswerForCurrentQuestion();

    if (!currentQuestion) {
        completeQuiz();
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

    const handleAnswerQuestion = (selectedOption: number) => {
        // Note: We're now using the mapped option indexes for correct answer checking
        // The mapping from shuffled to original indexes is handled in the store
        const timeRemaining = 100;
        answerQuestion(currentQuestion.id, selectedOption, timeRemaining);
    };

    const handleTimeUp = () => {
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
        <div className="min-h-[calc(100vh-10rem)] bg-background py-6 px-4">
            <QuizHeader
                title={currentCategory.name}
                onExit={handleBackToCategories}
            />

            <QuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={currentCategory.questions.length}
                userAnswer={userAnswer}
                isTimerRunning={isTimerRunning}
                onAnswer={handleAnswerQuestion}
                onTimeUp={handleTimeUp}
                onNext={handleNextQuestion}
            />
        </div>
    );
}