// app/routes/dashboard.tsx
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { BarChart4Icon, RefreshCwIcon } from 'lucide-react';

import { ProtectedRoute } from '~/components/protected-route';
import type { RecentQuizResult } from '~/types';
import { getRecentQuizResults } from '~/lib/supabase';

// Import dashboard components
import { StatsCards } from '~/components/dashboard/stats-cards';
import { OverallProgressChart } from '~/components/dashboard/overall-progress-chart';
import { CategoryPerformanceChart } from '~/components/dashboard/category-performance-chart';
import { TimeMetricsCard } from '~/components/dashboard/time-metrics-card';
import { StrengthsWeaknessesChart } from '~/components/dashboard/strengths-weaknesses-chart';
import { TimeCorrectnessChart } from '~/components/dashboard/time-correctness-chart';
import { CategoryTimingChart } from '~/components/dashboard/category-timing-chart';
import { TimeImprovementChart } from '~/components/dashboard/time-improvement-chart';
import { CategoryImprovementChart } from '~/components/dashboard/category-improvement-chart';
import { QuestionDifficultyChart } from '~/components/dashboard/question-difficulty-chart';
import { getCategoryPerformance, getTimeMetrics } from '~/lib/supabase-dashboard';

export function meta() {
    return [
        { title: "Personal Dashboard - NQESH Reviewer Pro" },
        { name: "description", content: "View your performance statistics and progress" },
    ];
}

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for each data type
    const [quizResults, setQuizResults] = useState<RecentQuizResult[]>([]);
    const [categoryPerformance, setCategoryPerformance] = useState<any[]>([]);
    const [timeMetrics, setTimeMetrics] = useState({
        averageTimeRemaining: 0,
        fastestAnswer: 0,
        slowestAnswer: 0,
        timeDistribution: [] as { bucket: string, count: number }[]
    });
    const [strengthsData, setStrengthsData] = useState<any[]>([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalQuizzes: 0,
        totalQuestions: 0,
        bestScore: 0,
        averageScore: 0,
        bestCategory: ''
    });

    // Tab state
    const [activeTab, setActiveTab] = useState("overview");

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            setError(null);

            // Fetch quiz results
            const { results, totalCount } = await getRecentQuizResults(user.id, 50);
            setQuizResults(results);

            // Fetch category performance
            const categoryData = await getCategoryPerformance(user.id);
            setCategoryPerformance(categoryData);

            // Fetch time metrics
            const timeData = await getTimeMetrics(user.id);
            setTimeMetrics(timeData);

            // Calculate strengths and weaknesses from category data
            const strengths = categoryData.map(category => ({
                category: category.categoryName,
                strength: category.overallPercentage,
                correctAnswers: category.totalCorrect,
                totalAnswers: category.totalQuestions
            }));
            setStrengthsData(strengths);

            // Calculate summary stats
            let totalScore = 0;
            let bestScore = 0;
            let bestCategoryName = '';

            categoryData.forEach(category => {
                if (category.overallPercentage > bestScore) {
                    bestScore = category.overallPercentage;
                    bestCategoryName = category.categoryName;
                }
            });

            results.forEach(result => {
                totalScore += (result.score / result.totalQuestions) * 100;
            });

            const totalQuestions = categoryData.reduce((sum, cat) => sum + cat.totalQuestions, 0);

            setDashboardStats({
                totalQuizzes: totalCount || 0,
                totalQuestions,
                bestScore,
                averageScore: results.length > 0 ? totalScore / results.length : 0,
                bestCategory: bestCategoryName || 'None yet'
            });

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    // Handle refresh
    const handleRefresh = () => {
        fetchDashboardData();
        toast.success('Dashboard refreshed');
    };

    return (
        <div className="container mx-auto py-6 px-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <BarChart4Icon className="h-6 w-6 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Learning Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            Track your progress and performance metrics
                        </p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="gap-1.5 cursor-pointer"
                    disabled={isLoading}
                >
                    <RefreshCwIcon className="h-4 w-4" />
                    <span>Refresh</span>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
                </div>
            ) : error ? (
                <Card className="mb-6">
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground mb-3">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="cursor-pointer"
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            ) : quizResults.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <BarChart4Icon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <h3 className="text-lg font-medium mb-2">No Quiz Data Yet</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-4">
                            Complete some quizzes to see your performance analytics and track your progress over time.
                        </p>
                        <Button
                            variant="default"
                            onClick={() => window.location.href = '/'}
                            className="cursor-pointer"
                        >
                            Start a Quiz
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Stats Summary */}
                    <div className="mb-6">
                        <StatsCards stats={dashboardStats} />
                    </div>

                    {/* Tabs for different dashboard views */}
                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="categories">Categories</TabsTrigger>
                            <TabsTrigger value="timing">Timing Analysis</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-6">
                            <OverallProgressChart quizResults={quizResults} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CategoryPerformanceChart categoryData={categoryPerformance} />
                                <StrengthsWeaknessesChart strengths={strengthsData} />
                            </div>
                            <QuestionDifficultyChart />
                        </TabsContent>

                        <TabsContent value="categories" className="space-y-6 mt-6">
                            <CategoryPerformanceChart categoryData={categoryPerformance} />
                            <StrengthsWeaknessesChart strengths={strengthsData} />
                            <CategoryImprovementChart />
                        </TabsContent>

                        <TabsContent value="timing" className="space-y-6 mt-6">
                            <TimeMetricsCard timeMetrics={timeMetrics} />
                            <TimeCorrectnessChart />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CategoryTimingChart />
                                <TimeImprovementChart />
                            </div>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}