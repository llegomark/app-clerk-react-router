// app/components/dashboard/category-timing-chart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getDetailedQuizAnswers } from '~/lib/supabase-dashboard';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/react-router';

interface CategoryTimingData {
    category: string;
    avgTimeSpent: number;
    correctRate: number;
    totalQuestions: number;
}

export function CategoryTimingChart() {
    const { user } = useUser();
    const [data, setData] = useState<CategoryTimingData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            setIsLoading(true);
            try {
                // Get detailed answer data
                const answers = await getDetailedQuizAnswers(user.id);

                // Process data by category
                const categoryMap = new Map<string, {
                    totalTime: number;
                    correctCount: number;
                    totalCount: number;
                }>();

                answers.forEach(answer => {
                    const category = answer.categoryName;
                    const timeSpent = 120 - answer.timeRemaining;

                    if (!categoryMap.has(category)) {
                        categoryMap.set(category, {
                            totalTime: 0,
                            correctCount: 0,
                            totalCount: 0
                        });
                    }

                    const categoryData = categoryMap.get(category)!;
                    categoryData.totalTime += timeSpent;
                    categoryData.totalCount += 1;
                    if (answer.isCorrect) {
                        categoryData.correctCount += 1;
                    }
                });

                // Transform to chart data format
                const chartData = Array.from(categoryMap.entries()).map(([category, data]) => ({
                    category,
                    avgTimeSpent: data.totalTime / data.totalCount,
                    correctRate: (data.correctCount / data.totalCount) * 100,
                    totalQuestions: data.totalCount
                }));

                // Sort by average time
                chartData.sort((a, b) => a.avgTimeSpent - b.avgTimeSpent);

                setData(chartData);
            } catch (err) {
                console.error('Error fetching category timing data:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [user]);

    // Chart configuration
    const chartConfig = {
        time: {
            label: 'Average Time Spent',
            color: 'var(--color-primary)'
        },
        rate: {
            label: 'Correct Rate',
            color: 'var(--color-success)'
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Category Time Analysis</CardTitle>
                <CardDescription>
                    Average time spent and success rate by category
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        </div>
                    ) : data.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                                    <XAxis
                                        type="number"
                                        label={{
                                            value: 'Seconds',
                                            position: 'insideBottom',
                                            offset: 0,
                                            style: { fontSize: '12px' }
                                        }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="category"
                                        width={120}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="font-medium">{data.category}</div>
                                                        <div className="text-xs text-muted-foreground">{data.totalQuestions} questions answered</div>
                                                        <div className="mt-1 grid gap-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-xs text-primary">Avg. Time:</span>
                                                                <span className="font-medium">{data.avgTimeSpent.toFixed(1)}s</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-xs text-success">Correct Rate:</span>
                                                                <span className="font-medium">{data.correctRate.toFixed(1)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="avgTimeSpent"
                                        name="Average Time Spent"
                                        fill="var(--color-primary)"
                                        radius={[0, 4, 4, 0]}
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">Complete more quizzes to see category timing analysis</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}