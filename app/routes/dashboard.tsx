// app/routes/dashboard.tsx
import { useState } from 'react';
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { BarChart4Icon, RefreshCwIcon } from 'lucide-react';

import { ProtectedRoute } from '~/components/protected-route';
import { useDashboardData } from '~/hooks/use-dashboard-queries';

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
    const {
        recentResults,
        categoryPerformance,
        timeMetrics,
        dashboardStats,
        strengthsData,
        isPending,
        error,
        refetch
    } = useDashboardData(user?.id || '');

    // Tab state
    const [activeTab, setActiveTab] = useState("overview");

    // Handle refresh
    const handleRefresh = () => {
        refetch();
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
                    disabled={isPending}
                >
                    <RefreshCwIcon className="h-4 w-4" />
                    <span>Refresh</span>
                </Button>
            </div>

            {isPending ? (
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
            ) : recentResults.length === 0 ? (
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
                            <OverallProgressChart quizResults={recentResults} />
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