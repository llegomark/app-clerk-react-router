// app/components/results-card.tsx
import React from 'react';
import { CheckIcon, HomeIcon, RepeatIcon, XIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Progress } from '~/components/ui/progress';
import type { Category, UserAnswer } from '~/types';
import { cn } from '~/lib/utils';

interface ResultsCardProps {
    category: Category;
    userAnswers: UserAnswer[];
    score: number;
    onTryAgain: () => void;
    onBackToCategories: () => void;
}

export function ResultsCard({
    category,
    userAnswers,
    score,
    onTryAgain,
    onBackToCategories,
}: ResultsCardProps) {
    const totalQuestions = category.questions.length;
    const scorePercentage = (score / totalQuestions) * 100;
    const unansweredCount = totalQuestions - userAnswers.length;

    // Determine performance level
    let performanceLevel = "Needs Improvement";
    let performanceColor = "text-destructive";

    if (scorePercentage >= 90) {
        performanceLevel = "Excellent";
        performanceColor = "text-success";
    } else if (scorePercentage >= 75) {
        performanceLevel = "Good";
        performanceColor = "text-primary";
    } else if (scorePercentage >= 60) {
        performanceLevel = "Average";
        performanceColor = "text-amber-500";
    }

    // Debug click handler
    const handleTryAgainClick = (e: React.MouseEvent) => {
        // Prevent default only if needed for debugging
        // e.preventDefault(); 
        console.log('Try Again button clicked');

        // Call the provided handler
        onTryAgain();
    };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-bold">Quiz Results</h1>
                <p className="text-sm text-muted-foreground">
                    {category.name}
                </p>
            </div>

            <Card>
                <CardHeader className="pb-2 px-4">
                    <CardTitle className="text-center text-lg">
                        {score} / {totalQuestions} Correct
                    </CardTitle>
                    <CardDescription className="text-center">
                        You scored {Math.round(scorePercentage)}%
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-4 py-3">
                    {/* Score Progress */}
                    <div className="space-y-1 mb-4">
                        <Progress
                            value={scorePercentage}
                            className={cn(
                                "h-2",
                                scorePercentage < 60 ? "progress-indicator:bg-destructive" :
                                    scorePercentage < 75 ? "progress-indicator:bg-amber-500" :
                                        "progress-indicator:bg-success"
                            )}
                        />
                        <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">0%</span>
                            <span className={`text-sm font-medium ${performanceColor}`}>
                                {performanceLevel}
                            </span>
                            <span className="text-xs text-muted-foreground">100%</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-accent/50 rounded-md p-2 text-center">
                            <div className="flex justify-center mb-1">
                                <CheckIcon className="size-4 text-success" />
                            </div>
                            <div className="text-lg font-semibold">{score}</div>
                            <div className="text-xs text-muted-foreground">Correct</div>
                        </div>

                        <div className="bg-accent/50 rounded-md p-2 text-center">
                            <div className="flex justify-center mb-1">
                                <XIcon className="size-4 text-destructive" />
                            </div>
                            <div className="text-lg font-semibold">
                                {userAnswers.filter(a => !a.isCorrect).length}
                            </div>
                            <div className="text-xs text-muted-foreground">Incorrect</div>
                        </div>

                        <div className="bg-accent/50 rounded-md p-2 text-center">
                            <div className="flex justify-center mb-1">
                                <span className="size-4 text-muted-foreground">-</span>
                            </div>
                            <div className="text-lg font-semibold">{unansweredCount}</div>
                            <div className="text-xs text-muted-foreground">Unanswered</div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2 px-4 py-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1"
                        onClick={onBackToCategories}
                    >
                        <HomeIcon className="size-4" />
                        <span>Categories</span>
                    </Button>

                    <Button
                        size="sm"
                        className="cursor-pointer gap-1"
                        onClick={handleTryAgainClick}
                    >
                        <RepeatIcon className="size-4" />
                        <span>Try Again</span>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}