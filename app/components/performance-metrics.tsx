// app/components/performance-metrics.tsx
import { TrophyIcon, BarChart2Icon, CalendarIcon, TrendingUpIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import type { RecentQuizResult } from '~/types';

interface StatisticProps {
    label: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

function Statistic({ label, value, description, icon, trend, trendValue }: StatisticProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                    {icon && <div className="text-primary">{icon}</div>}
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>

                {trend && trendValue && (
                    <Badge variant="outline" className={cn(
                        "text-xs font-normal",
                        trend === 'up' ? "text-success" :
                            trend === 'down' ? "text-destructive" :
                                "text-muted-foreground"
                    )}>
                        {trendValue}
                    </Badge>
                )}
            </div>
            <div className="flex items-baseline gap-1">
                <p className="text-2xl font-medium">{value}</p>
                {description && <p className="text-xs text-muted-foreground self-end">{description}</p>}
            </div>
        </div>
    );
}

interface PerformanceMetricsProps {
    allResults: RecentQuizResult[];
    currentResult: {
        score: number;
        totalQuestions: number;
    };
    totalQuizCount?: number;
}

export function PerformanceMetrics({ allResults, currentResult, totalQuizCount }: PerformanceMetricsProps) {
    // Calculate metrics - Use totalQuizCount if provided, otherwise add 1 to include the current quiz
    const quizzesTaken = totalQuizCount !== undefined ? totalQuizCount + 1 : allResults.length + 1;

    // Calculate percentage scores
    const currentPercentage = (currentResult.score / currentResult.totalQuestions) * 100;
    const allScorePercentages = allResults.map(r => (r.score / r.totalQuestions) * 100);

    // Best score
    const bestScore = Math.max(...allScorePercentages, currentPercentage);

    // Average score (including current)
    const allScores = [...allScorePercentages, currentPercentage];
    const averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;

    // Calculate improvement (current vs previous best)
    let improvement = 0;
    let improvementTrend: 'up' | 'down' | 'neutral' = 'neutral';

    if (allScorePercentages.length > 0) {
        const previousBest = Math.max(...allScorePercentages);
        improvement = currentPercentage - previousBest;
        improvementTrend = improvement > 0 ? 'up' : improvement < 0 ? 'down' : 'neutral';
    }

    // Calculate streak (consecutive quizzes with improvement)
    let streak = 0;
    if (allResults.length >= 2) {
        const sortedResults = [...allResults].sort((a, b) =>
            new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
        );

        for (let i = 1; i < sortedResults.length; i++) {
            const current = (sortedResults[i].score / sortedResults[i].totalQuestions) * 100;
            const previous = (sortedResults[i - 1].score / sortedResults[i - 1].totalQuestions) * 100;

            if (current > previous) {
                streak++;
            } else {
                // Reset streak if no improvement
                streak = 0;
            }
        }
    }

    // Calculate achievement level
    let achievementLevel = '';
    let achievementProgress = 0;

    if (bestScore >= 90) {
        achievementLevel = 'Expert';
        achievementProgress = 100;
    } else if (bestScore >= 80) {
        achievementLevel = 'Advanced';
        achievementProgress = 80;
    } else if (bestScore >= 70) {
        achievementLevel = 'Intermediate';
        achievementProgress = 60;
    } else if (bestScore >= 60) {
        achievementLevel = 'Developing';
        achievementProgress = 40;
    } else {
        achievementLevel = 'Novice';
        achievementProgress = 20;
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart2Icon className="size-5 text-primary" />
                    Your Performance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-5">
                    {/* Achievement Level */}
                    <div className="space-y-2 pb-3 border-b">
                        <div className="flex justify-between items-baseline">
                            <p className="text-sm font-medium">Achievement Level</p>
                            <Badge variant="outline" className="bg-primary/5">{achievementLevel}</Badge>
                        </div>
                        <Progress value={achievementProgress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">
                            Complete more quizzes with high scores to reach the next level.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Statistic
                            label="Quizzes Completed"
                            value={quizzesTaken}
                            icon={<CalendarIcon className="size-3.5" />}
                        />
                        <Statistic
                            label="Best Score"
                            value={`${bestScore.toFixed(0)}%`}
                            icon={<TrophyIcon className="size-3.5" />}
                        />
                        <Statistic
                            label="Average Score"
                            value={`${averageScore.toFixed(0)}%`}
                            icon={<BarChart2Icon className="size-3.5" />}
                        />
                        <Statistic
                            label="Improvement"
                            value={`${improvement > 0 ? '+' : ''}${improvement.toFixed(0)}%`}
                            description="vs. previous best"
                            icon={<TrendingUpIcon className="size-3.5" />}
                            trend={improvementTrend}
                            trendValue={improvement > 0 ? "Improved" : improvement < 0 ? "Decreased" : "No change"}
                        />
                    </div>

                    {/* Improvement Streak */}
                    {allResults.length > 0 && (
                        <div className="pt-3 border-t">
                            <div className="flex justify-between items-baseline">
                                <p className="text-xs text-muted-foreground">Improvement Streak</p>
                                <p className="text-sm font-medium">{streak} {streak === 1 ? 'quiz' : 'quizzes'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}