// app/components/results-card.tsx
import React from 'react';
import { CheckIcon, HomeIcon, RepeatIcon, XIcon, TargetIcon, ClockIcon, AwardIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Progress } from '~/components/ui/progress';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import type { Category, UserAnswer } from '~/types';
import { cn } from '~/lib/utils';

interface ResultsCardProps {
    category: Category;
    userAnswers: UserAnswer[];
    score: number;
    onTryAgain: () => void;
    onBackToCategories: () => void;
    onReviewAnswers?: () => void;
}

export function ResultsCard({
    category,
    userAnswers,
    score,
    onTryAgain,
    onBackToCategories,
    onReviewAnswers,
}: ResultsCardProps) {
    const totalQuestions = category.questions.length;
    const scorePercentage = (score / totalQuestions) * 100;
    const unansweredCount = totalQuestions - userAnswers.length;

    // Calculate average time spent
    const totalTimeSpent = userAnswers.reduce((total, answer) => total + (120 - answer.timeRemaining), 0);
    const averageTimePerQuestion = userAnswers.length > 0
        ? Math.round(totalTimeSpent / userAnswers.length)
        : 0;

    // Determine performance level and color
    let performanceLevel = "";
    let performanceColor = "";

    if (scorePercentage >= 90) {
        performanceLevel = "Excellent";
        performanceColor = "text-success";
    } else if (scorePercentage >= 75) {
        performanceLevel = "Good";
        performanceColor = "text-primary";
    } else if (scorePercentage >= 60) {
        performanceLevel = "Average";
        performanceColor = "text-amber-500";
    } else {
        performanceLevel = "Needs Improvement";
        performanceColor = "text-destructive";
    }

    return (
        <Card className="border-border/50 shadow-xs">
            <CardHeader className="pb-2 space-y-1.5">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <AwardIcon className="size-5 text-primary" />
                        Quiz Results: {category.name}
                    </CardTitle>

                    <Badge
                        variant="outline"
                        className={cn(
                            "text-sm font-medium",
                            scorePercentage >= 90 ? "border-success text-success" :
                                scorePercentage >= 75 ? "border-primary text-primary" :
                                    scorePercentage >= 60 ? "border-amber-500 text-amber-500" :
                                        "border-destructive text-destructive"
                        )}
                    >
                        {performanceLevel}
                    </Badge>
                </div>

                <CardDescription className="text-base">
                    You scored {Math.round(scorePercentage)}% on this quiz
                </CardDescription>
            </CardHeader>

            <CardContent className="px-6 py-3">
                {/* Score Progress */}
                <div className="space-y-1 mb-5">
                    <Progress
                        value={scorePercentage}
                        className={cn(
                            "h-2.5",
                            scorePercentage < 60 ? "bg-muted [&>div]:bg-destructive" :
                                scorePercentage < 75 ? "bg-muted [&>div]:bg-amber-500" :
                                    "bg-muted [&>div]:bg-success"
                        )}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span className={performanceColor}>{Math.round(scorePercentage)}%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="flex flex-col items-center justify-center p-3 rounded-md bg-accent/50">
                        <div className="size-7 flex items-center justify-center rounded-full bg-success/10 mb-1.5">
                            <CheckIcon className="size-4 text-success" />
                        </div>
                        <div className="text-lg font-semibold">{score}</div>
                        <div className="text-xs text-muted-foreground">Correct</div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 rounded-md bg-accent/50">
                        <div className="size-7 flex items-center justify-center rounded-full bg-destructive/10 mb-1.5">
                            <XIcon className="size-4 text-destructive" />
                        </div>
                        <div className="text-lg font-semibold">
                            {userAnswers.filter(a => !a.isCorrect).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Incorrect</div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 rounded-md bg-accent/50">
                        <div className="size-7 flex items-center justify-center rounded-full bg-muted mb-1.5">
                            <ClockIcon className="size-4 text-muted-foreground" />
                        </div>
                        <div className="text-lg font-semibold">{averageTimePerQuestion}s</div>
                        <div className="text-xs text-muted-foreground">Avg. Time</div>
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-accent/30 rounded-md p-3 flex items-start gap-3 mb-3">
                    <TargetIcon className="size-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium mb-1">Performance Summary</h3>
                        <p className="text-xs text-muted-foreground">
                            {scorePercentage >= 90
                                ? "Outstanding performance! You've mastered this category."
                                : scorePercentage >= 75
                                    ? "Great work! You have a solid understanding of this material."
                                    : scorePercentage >= 60
                                        ? "Good effort! Keep practicing to improve your score."
                                        : "You're making progress. Focus on reviewing the questions you missed."
                            }
                        </p>
                    </div>
                </div>

                {/* Quick Tips */}
                {scorePercentage < 90 && (
                    <div className="text-xs text-muted-foreground mt-2 mb-3">
                        <p className="font-medium mb-2">Quick Tips for Improvement:</p>
                        <ul className="list-disc list-inside space-y-1 pl-1">
                            <li>Review the questions you missed</li>
                            <li>Focus on areas where you scored lowest</li>
                            <li>Practice similar questions to reinforce learning</li>
                        </ul>
                    </div>
                )}
            </CardContent>

            <Separator />

            <CardFooter className="flex justify-end gap-2 px-6 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1.5"
                    onClick={onBackToCategories}
                >
                    <HomeIcon className="size-3.5" />
                    <span>Categories</span>
                </Button>

                {onReviewAnswers && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1.5"
                        onClick={onReviewAnswers}
                    >
                        <ClockIcon className="size-3.5" />
                        <span>Review Answers</span>
                    </Button>
                )}

                <Button
                    size="sm"
                    className="cursor-pointer gap-1.5"
                    onClick={onTryAgain}
                >
                    <RepeatIcon className="size-3.5" />
                    <span>Try Again</span>
                </Button>
            </CardFooter>
        </Card>
    );
}