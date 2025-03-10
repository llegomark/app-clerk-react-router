// app/components/dashboard/stats-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { BookOpenIcon, AwardIcon, TrophyIcon, BrainIcon } from 'lucide-react';

interface DashboardStats {
    totalQuizzes: number;
    totalQuestions: number;
    bestScore: number;
    averageScore: number;
    bestCategory: string;
}

interface StatsCardsProps {
    stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                    <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.totalQuestions} questions answered
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    <AwardIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Across all quizzes
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                    <TrophyIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.bestScore.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Your highest achievement
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Best Category</CardTitle>
                    <BrainIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold truncate">{stats.bestCategory}</div>
                    <p className="text-xs text-muted-foreground">
                        Your strongest subject
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}