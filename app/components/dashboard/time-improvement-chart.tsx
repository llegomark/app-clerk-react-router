// app/components/dashboard/time-improvement-chart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getDetailedQuizAnswers } from '~/lib/supabase-dashboard';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/react-router';
import { format } from 'date-fns';

interface QuizTimingData {
    date: string;
    rawDate: string; // For sorting
    avgTimeSpent: number;
    avgTimeRemaining: number;
    correctPercentage: number;
    quizId: number;
}

export function TimeImprovementChart() {
    const { user } = useUser();
    const [data, setData] = useState<QuizTimingData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            setIsLoading(true);
            try {
                // Get detailed answer data
                const answers = await getDetailedQuizAnswers(user.id);

                // Group by quiz
                const quizMap = new Map<string, {
                    quizId: number;
                    totalTime: number;
                    totalRemaining: number;
                    correctCount: number;
                    totalCount: number;
                    completedAt: string;
                }>();

                answers.forEach(answer => {
                    const quizId = answer.quizId;
                    const quizKey = quizId.toString();

                    if (!quizMap.has(quizKey)) {
                        quizMap.set(quizKey, {
                            quizId,
                            totalTime: 0,
                            totalRemaining: 0,
                            correctCount: 0,
                            totalCount: 0,
                            completedAt: answer.completedAt
                        });
                    }

                    const quizData = quizMap.get(quizKey)!;
                    quizData.totalTime += (120 - answer.timeRemaining);
                    quizData.totalRemaining += answer.timeRemaining;
                    quizData.totalCount += 1;
                    if (answer.isCorrect) {
                        quizData.correctCount += 1;
                    }
                });

                // Transform to chart data
                const chartData = Array.from(quizMap.values()).map(quiz => {
                    const date = new Date(quiz.completedAt);
                    return {
                        quizId: quiz.quizId,
                        rawDate: quiz.completedAt,
                        date: format(date, 'MMM d'),
                        avgTimeSpent: quiz.totalTime / quiz.totalCount,
                        avgTimeRemaining: quiz.totalRemaining / quiz.totalCount,
                        correctPercentage: (quiz.correctCount / quiz.totalCount) * 100
                    };
                });

                // Sort by date
                chartData.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

                setData(chartData);
            } catch (err) {
                console.error('Error fetching time improvement data:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [user]);

    // Chart configuration
    const chartConfig = {
        timeSpent: {
            label: 'Avg. Time Spent',
            color: 'var(--color-primary)'
        },
        timeRemaining: {
            label: 'Avg. Time Remaining',
            color: 'var(--color-success)'
        },
        correctRate: {
            label: 'Correct Rate',
            color: 'var(--color-chart-1)'
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Time Management Improvement</CardTitle>
                <CardDescription>
                    How your timing and performance have changed over quizzes
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        </div>
                    ) : data.length > 1 ? (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={data}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="date" />
                                    <YAxis
                                        yAxisId="time"
                                        label={{
                                            value: 'Seconds',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fontSize: '12px' }
                                        }}
                                    />
                                    <YAxis
                                        yAxisId="percentage"
                                        orientation="right"
                                        domain={[0, 100]}
                                        label={{
                                            value: 'Percentage',
                                            angle: 90,
                                            position: 'insideRight',
                                            style: { fontSize: '12px' }
                                        }}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="font-medium">Quiz on {data.date}</div>
                                                        <div className="mt-1 grid gap-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-xs text-primary">Avg. Time Spent:</span>
                                                                <span className="font-medium">{data.avgTimeSpent.toFixed(1)}s</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-xs text-success">Avg. Time Remaining:</span>
                                                                <span className="font-medium">{data.avgTimeRemaining.toFixed(1)}s</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-xs" style={{ color: 'var(--color-chart-1)' }}>Correct Rate:</span>
                                                                <span className="font-medium">{data.correctPercentage.toFixed(1)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line
                                        yAxisId="time"
                                        type="monotone"
                                        dataKey="avgTimeSpent"
                                        name="Avg. Time Spent"
                                        stroke="var(--color-primary)"
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        yAxisId="time"
                                        type="monotone"
                                        dataKey="avgTimeRemaining"
                                        name="Avg. Time Remaining"
                                        stroke="var(--color-success)"
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        yAxisId="percentage"
                                        type="monotone"
                                        dataKey="correctPercentage"
                                        name="Correct Rate"
                                        stroke="var(--color-chart-1)"
                                        activeDot={{ r: 6 }}
                                    />
                                    <Legend />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">Complete more quizzes to see timing improvement trends</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}