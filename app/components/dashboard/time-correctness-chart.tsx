// app/components/dashboard/time-correctness-chart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getDetailedQuizAnswers } from '~/lib/supabase-dashboard';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/react-router';

interface TimeCorrectnessData {
    timeUsed: number;
    correctnessValue: number; // 0 or 1 instead of boolean
    isCorrect: boolean; // Keep for reference
    category: string;
}

export function TimeCorrectnessChart() {
    const { user } = useUser();
    const [data, setData] = useState<TimeCorrectnessData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            setIsLoading(true);
            try {
                // Get detailed answer data
                const answers = await getDetailedQuizAnswers(user.id);

                // Transform for scatter plot - calculate time used (120 - timeRemaining)
                // Convert boolean to numeric for the y-axis
                const timeData = answers.map(answer => ({
                    timeUsed: 120 - answer.timeRemaining,
                    correctnessValue: answer.isCorrect ? 1 : 0, // Convert boolean to number
                    isCorrect: answer.isCorrect,
                    category: answer.categoryName
                }));

                setData(timeData);
            } catch (err) {
                console.error('Error fetching time data:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [user]);

    // Split data into correct and incorrect answers
    const correctAnswers = data.filter(item => item.isCorrect);
    const incorrectAnswers = data.filter(item => !item.isCorrect);

    // Chart configuration
    const chartConfig = {
        correct: {
            label: 'Correct Answers',
            color: 'var(--color-success)'
        },
        incorrect: {
            label: 'Incorrect Answers',
            color: 'var(--color-destructive)'
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Time vs. Correctness</CardTitle>
                <CardDescription>
                    Relationship between time spent and answer correctness
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
                                <ScatterChart
                                    margin={{ top: 20, right: 20, bottom: 50, left: 40 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis
                                        type="number"
                                        dataKey="timeUsed"
                                        name="Time Spent"
                                        label={{
                                            value: 'Time Spent (seconds)',
                                            position: 'bottom',
                                            offset: 20,
                                            style: { fontSize: '12px' }
                                        }}
                                        domain={[0, 120]}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="correctnessValue"
                                        name="Correctness"
                                        domain={[-0.5, 1.5]}
                                        ticks={[0, 1]}
                                        tickFormatter={(value) => value === 1 ? 'Correct' : 'Incorrect'}
                                        label={{
                                            value: 'Answer Result',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fontSize: '12px' }
                                        }}
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        formatter={(value) => [`${value} seconds`, 'Time Spent']}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-xs">
                                                        <div className="font-medium">{data.isCorrect ? 'Correct Answer' : 'Incorrect Answer'}</div>
                                                        <div className="text-xs text-muted-foreground">{data.category}</div>
                                                        <div className="mt-1 font-medium">
                                                            Time spent: {data.timeUsed} seconds
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Scatter
                                        name="Correct Answers"
                                        data={correctAnswers}
                                        fill="var(--color-success)"
                                        shape="circle"
                                    />
                                    <Scatter
                                        name="Incorrect Answers"
                                        data={incorrectAnswers}
                                        fill="var(--color-destructive)"
                                        shape="circle"
                                    />
                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="top"
                                        align="center"
                                        wrapperStyle={{ paddingBottom: 10 }}
                                    />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">Complete more quizzes to see time analysis</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}