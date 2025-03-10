// app/routes/results.tsx
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';
import {
    BarChart4Icon,
    MedalIcon,
    Share2Icon,
    BookOpenIcon,
    ArrowLeftIcon,
    BookmarkIcon,
    XCircleIcon,
    CheckCircleIcon,
    HelpCircleIcon
} from 'lucide-react';

import type { Route } from "./+types/results";
import { useQuizStore } from '~/lib/store';
import { ResultsCard } from '~/components/results-card';
import { UserProgressChart } from '~/components/user-progress-chart';
import { PerformanceMetrics } from '~/components/performance-metrics';
import { QuestionBreakdownChart } from '~/components/question-breakdown-chart';
import { logDebug, getCategoryWithQuestions, getRecentQuizResults, logError } from '~/lib/supabase';
import type { RecentQuizResult, Question, UserAnswer, Category, ShuffledQuestion } from '~/types';
import { ProtectedRoute } from '~/components/protected-route';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { Progress } from '~/components/ui/progress';

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

// Separate the content into its own component
function ResultsContent() {
    const navigate = useNavigate();
    const { user } = useUser();

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
    const [activeTab, setActiveTab] = useState('overview');
    const [showAnswers, setShowAnswers] = useState(false);

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
            // This is a regular category quiz
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
    const percentageScore = (score / totalQuestions) * 100;

    // Calculate status and message based on score
    let scoreStatus = '';
    let scoreMessage = '';

    if (percentageScore >= 90) {
        scoreStatus = 'Excellence';
        scoreMessage = 'Outstanding performance! You\'ve mastered this category.';
    } else if (percentageScore >= 80) {
        scoreStatus = 'Strong';
        scoreMessage = 'Great job! You have a solid understanding of this category.';
    } else if (percentageScore >= 70) {
        scoreStatus = 'Good';
        scoreMessage = 'Good work! Continue practicing to improve further.';
    } else if (percentageScore >= 60) {
        scoreStatus = 'Satisfactory';
        scoreMessage = 'You\'re on the right track. Focus on your weak areas.';
    } else {
        scoreStatus = 'Needs Improvement';
        scoreMessage = 'Keep practicing! Review the questions you missed.';
    }

    // Toggle between overview and detailed answers
    const toggleAnswers = () => {
        setShowAnswers(!showAnswers);
    };

    return (
        <div className="container mx-auto py-6 px-4 max-w-4xl">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <MedalIcon className="size-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Quiz Results</h1>
                        <p className="text-sm text-muted-foreground">
                            {currentCategory.name}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 self-end md:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBackToCategories}
                        className="cursor-pointer gap-1.5"
                    >
                        <ArrowLeftIcon className="size-3.5" />
                        <span>Categories</span>
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={toggleAnswers}
                        className="cursor-pointer gap-1.5"
                    >
                        {showAnswers ? (
                            <>
                                <BarChart4Icon className="size-3.5" />
                                <span>Show Overview</span>
                            </>
                        ) : (
                            <>
                                <BookOpenIcon className="size-3.5" />
                                <span>Review Answers</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {showAnswers ? (
                <ReviewAnswers
                    category={currentCategory}
                    userAnswers={userAnswers}
                    handleBackToOverview={() => setShowAnswers(false)}
                    handleTryAgain={handleTryAgain}
                />
            ) : (
                <div className="space-y-6">
                    {/* Score summary card */}
                    <ScoreSummaryCard
                        score={score}
                        totalQuestions={totalQuestions}
                        status={scoreStatus}
                        message={scoreMessage}
                        handleTryAgain={handleTryAgain}
                    />

                    {/* Dashboard tabs */}
                    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="progress">Your Progress</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <QuestionBreakdownChart
                                    userAnswers={userAnswers}
                                    totalQuestions={totalQuestions}
                                />
                                <PerformanceMetrics
                                    allResults={previousResults}
                                    currentResult={{
                                        score: score,
                                        totalQuestions: totalQuestions
                                    }}
                                    totalQuizCount={totalQuizCount}
                                />
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Improvement Areas</CardTitle>
                                    <CardDescription>
                                        Focus on these topics to improve your score
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {userAnswers.filter(a => !a.isCorrect).length > 0 ? (
                                            <ImprovementSuggestions
                                                userAnswers={userAnswers}
                                                questions={currentCategory.questions}
                                            />
                                        ) : (
                                            <div className="text-center p-4">
                                                <CheckCircleIcon className="size-10 text-success mx-auto mb-2" />
                                                <p className="text-sm font-medium">Great job! You've answered all questions correctly.</p>
                                                <p className="text-xs text-muted-foreground mt-1">Try another category to continue your preparation.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="progress" className="space-y-6">
                            {previousResults.length > 0 ? (
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
                            ) : (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <BarChart4Icon className="size-12 mx-auto text-muted-foreground mb-3" />
                                        <h3 className="text-lg font-medium mb-2">No Progress History</h3>
                                        <p className="text-muted-foreground mb-4">This is your first quiz! Complete more quizzes to track your progress over time.</p>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatCard
                                    title="Total Quizzes"
                                    value={totalQuizCount + 1}
                                    description="Completed so far"
                                    icon={<BookOpenIcon className="size-4 text-primary" />}
                                />
                                <StatCard
                                    title="Best Score"
                                    value={`${calculateBestScore(previousResults, percentageScore)}%`}
                                    description="Your highest achievement"
                                    icon={<MedalIcon className="size-4 text-primary" />}
                                />
                                <StatCard
                                    title="Improvement"
                                    value={calculateImprovement(previousResults, percentageScore)}
                                    description="vs. previous attempts"
                                    icon={<BarChart4Icon className="size-4 text-primary" />}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}

// Helper component for score summary
interface ScoreSummaryCardProps {
    score: number;
    totalQuestions: number;
    status: string;
    message: string;
    handleTryAgain: () => void;
}

function ScoreSummaryCard({ score, totalQuestions, status, message, handleTryAgain }: ScoreSummaryCardProps) {
    const scorePercentage = (score / totalQuestions) * 100;

    // Determine color based on score percentage
    let progressColor = "";
    if (scorePercentage >= 90) progressColor = "bg-success";
    else if (scorePercentage >= 70) progressColor = "bg-primary";
    else if (scorePercentage >= 60) progressColor = "bg-amber-500";
    else progressColor = "bg-destructive";

    return (
        <Card className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 h-1 w-full ${progressColor}`}></div>
            <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            {scorePercentage >= 70 ? (
                                <MedalIcon className="size-5 text-primary" />
                            ) : (
                                <BookmarkIcon className="size-5 text-primary" />
                            )}
                            {score} / {totalQuestions} Correct
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                            You scored {Math.round(scorePercentage)}% - {status}
                        </CardDescription>
                    </div>
                    <Button
                        onClick={handleTryAgain}
                        className="cursor-pointer gap-1 shrink-0 md:self-center"
                    >
                        Try Again
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm">{message}</p>
                    <Progress value={scorePercentage} className={`h-2`} />
                </div>
            </CardContent>
        </Card>
    );
}

// Helper component for stats card
interface StatCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: ReactNode;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                        {icon}
                    </div>
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

// Helper component to review answers
interface ReviewAnswersProps {
    category: Category;
    userAnswers: UserAnswer[];
    handleBackToOverview: () => void;
    handleTryAgain: () => void;
}

function ReviewAnswers({ category, userAnswers, handleBackToOverview, handleTryAgain }: ReviewAnswersProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Review Your Answers</h2>
            </div>

            <div className="space-y-4">
                {category.questions.map((question: Question | ShuffledQuestion, index: number) => {
                    const userAnswer = userAnswers.find(a => a.questionId === question.id);
                    const isCorrect = userAnswer?.isCorrect || false;
                    const isUnanswered = !userAnswer;

                    return (
                        <Card key={question.id} className={`border ${isCorrect ? 'border-success/30' : (isUnanswered ? 'border-muted' : 'border-destructive/30')}`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="whitespace-nowrap">
                                            Question {index + 1}
                                        </Badge>
                                        {isCorrect ? (
                                            <Badge className="bg-success/80 text-background">Correct</Badge>
                                        ) : isUnanswered ? (
                                            <Badge variant="outline" className="border-muted-foreground text-muted-foreground">Not Answered</Badge>
                                        ) : (
                                            <Badge className="bg-destructive/80 text-background">Incorrect</Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <ClockIcon userAnswer={userAnswer} />
                                    </div>
                                </div>

                                <CardTitle className="text-base mt-2">
                                    {question.question}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="pb-2">
                                <div className="space-y-2">
                                    {question.options.map((option: string, optionIndex: number) => {
                                        // Determine if this is the selected option, correct option, or neither
                                        const isSelected = userAnswer?.selectedOption === optionIndex;
                                        const isCorrectOption = 'optionIndexMap' in question
                                            ? question.optionIndexMap.get(optionIndex) === question.correctAnswer
                                            : optionIndex === question.correctAnswer;

                                        let optionClassName = "p-3 border rounded-md text-sm";

                                        if (isSelected && isCorrectOption) {
                                            // Selected AND correct
                                            optionClassName += " bg-success/10 border-success/40 text-foreground";
                                        } else if (isCorrectOption) {
                                            // Correct but not selected
                                            optionClassName += " bg-success/5 border-success/30 text-foreground";
                                        } else if (isSelected) {
                                            // Selected but incorrect
                                            optionClassName += " bg-destructive/10 border-destructive/40 text-foreground";
                                        }

                                        return (
                                            <div key={optionIndex} className={optionClassName}>
                                                <div className="flex gap-2">
                                                    {isSelected && isCorrectOption && (
                                                        <CheckCircleIcon className="size-4 text-success shrink-0 mt-0.5" />
                                                    )}
                                                    {isSelected && !isCorrectOption && (
                                                        <XCircleIcon className="size-4 text-destructive shrink-0 mt-0.5" />
                                                    )}
                                                    {!isSelected && isCorrectOption && (
                                                        <CheckCircleIcon className="size-4 text-success shrink-0 mt-0.5" />
                                                    )}
                                                    {!isSelected && !isCorrectOption && (
                                                        <div className="size-4 shrink-0"></div>
                                                    )}
                                                    <span>{option}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>

                            {question.explanation && (
                                <CardFooter className="flex flex-col items-start pt-1 pb-4">
                                    <Separator className="mb-3" />
                                    <div className="flex gap-2">
                                        <HelpCircleIcon className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-1">Explanation</p>
                                            <p className="text-sm">{question.explanation}</p>
                                        </div>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

// Helper component to show time information
interface ClockIconProps {
    userAnswer: UserAnswer | undefined;
}

function ClockIcon({ userAnswer }: ClockIconProps) {
    if (!userAnswer) return null;

    const timeSpent = 120 - userAnswer.timeRemaining;
    const isTimeGood = timeSpent < 60;

    return (
        <span className={`flex items-center gap-1 ${isTimeGood ? 'text-success' : 'text-amber-500'}`}>
            {isTimeGood ? (
                <>Time: {timeSpent}s</>
            ) : (
                <>Time: {timeSpent}s</>
            )}
        </span>
    );
}

// Helper component for improvement suggestions
interface ImprovementSuggestionsProps {
    userAnswers: UserAnswer[];
    questions: (Question | ShuffledQuestion)[];
}

interface ImprovementArea {
    topic: string;
    question: Question | ShuffledQuestion;
}

function ImprovementSuggestions({ userAnswers, questions }: ImprovementSuggestionsProps) {
    // Group incorrect answers by topics or patterns
    const incorrectAnswers = userAnswers.filter(a => !a.isCorrect);

    if (incorrectAnswers.length === 0) {
        return (
            <div className="text-center p-4">
                <p className="text-sm">Great job! No improvement areas identified.</p>
            </div>
        );
    }

    // Find the questions that were answered incorrectly
    const incorrectQuestions = incorrectAnswers.map(answer => {
        return questions.find(q => q.id === answer.questionId);
    }).filter(Boolean) as (Question | ShuffledQuestion)[];

    // Extract categories or topics from the questions
    // For this example, we'll just use the first few words of each question
    // In a real app, you might have question categories or topics
    const improvementAreas = incorrectQuestions.map(question => {
        // Extract first 3-5 words as a "topic"
        const words = question.question.split(' ');
        const topic = words.slice(0, Math.min(4, words.length)).join(' ') + '...';
        return { topic, question };
    });

    return (
        <div className="space-y-3">
            {improvementAreas.slice(0, 3).map((area: ImprovementArea, index: number) => (
                <div key={index} className="p-3 border rounded-md">
                    <h4 className="font-medium text-sm mb-1">Topic: {area.topic}</h4>
                    <p className="text-xs text-muted-foreground">
                        Review questions related to this topic to improve your understanding.
                    </p>
                </div>
            ))}

            {improvementAreas.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                    And {improvementAreas.length - 3} more areas to improve...
                </p>
            )}
        </div>
    );
}

// Helper function to calculate best score
function calculateBestScore(previousResults: RecentQuizResult[], currentScore: number): number {
    if (previousResults.length === 0) return Math.round(currentScore);

    const previousBestPercentage = Math.max(
        ...previousResults.map(result => (result.score / result.totalQuestions) * 100)
    );

    return Math.round(Math.max(previousBestPercentage, currentScore));
}

// Helper function to calculate improvement
function calculateImprovement(previousResults: RecentQuizResult[], currentScore: number): string {
    if (previousResults.length === 0) return "N/A";

    // Get the average of previous scores
    const previousScores = previousResults.map(
        result => (result.score / result.totalQuestions) * 100
    );

    const averagePreviousScore =
        previousScores.reduce((sum: number, score: number) => sum + score, 0) / previousScores.length;

    const improvement = currentScore - averagePreviousScore;

    // Format with plus sign for positive improvement
    return improvement > 0
        ? `+${Math.round(improvement)}%`
        : `${Math.round(improvement)}%`;
}