// app/components/performance-metrics.tsx
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type { RecentQuizResult } from '~/types';

interface StatisticProps {
    label: string;
    value: string | number;
    description?: string;
}

function Statistic({ label, value, description }: StatisticProps) {
    return (
        <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-medium">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
    );
}

interface PerformanceMetricsProps {
    allResults: RecentQuizResult[];
    currentResult: {
        score: number;
        totalQuestions: number;
    };
}

export function PerformanceMetrics({ allResults, currentResult }: PerformanceMetricsProps) {
    // Calculate metrics
    const quizzesTaken = allResults.length;

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
    if (allScorePercentages.length > 0) {
        const previousBest = Math.max(...allScorePercentages);
        improvement = currentPercentage - previousBest;
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

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <Statistic
                        label="Quizzes Completed"
                        value={quizzesTaken}
                    />
                    <Statistic
                        label="Best Score"
                        value={`${bestScore.toFixed(0)}%`}
                    />
                    <Statistic
                        label="Average Score"
                        value={`${averageScore.toFixed(0)}%`}
                    />
                    <Statistic
                        label="Improvement"
                        value={`${improvement > 0 ? '+' : ''}${improvement.toFixed(0)}%`}
                        description={improvement > 0 ? "vs. previous best" : "vs. previous best"}
                    />
                </div>
            </CardContent>
        </Card>
    );
}