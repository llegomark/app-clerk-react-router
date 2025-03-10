// app/components/dashboard/overall-progress-chart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import type { RecentQuizResult } from '~/types';

interface OverallProgressChartProps {
    quizResults: RecentQuizResult[];
}

export function OverallProgressChart({ quizResults }: OverallProgressChartProps) {
    // Process quiz results for the chart
    const chartData = quizResults
        .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
        .map(result => {
            // Calculate percentage score
            const percentageScore = ((result.score / result.totalQuestions) * 100).toFixed(1);
            // Format date to be readable
            const formattedDate = format(new Date(result.completedAt), 'MMM d');

            return {
                date: formattedDate,
                score: parseFloat(percentageScore),
                category: result.categoryName,
                categoryId: result.categoryId,
                id: result.id
            };
        });

    // Calculate trend line data if enough points
    const trendLineData = chartData.length >= 3 ? calculateTrendLine(chartData) : [];

    // Chart configuration
    const chartConfig = {
        score: {
            label: 'Score (%)',
            color: 'var(--color-primary)'
        },
        trend: {
            label: 'Trend',
            color: 'var(--color-success)'
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
                <CardDescription>
                    Your quiz scores over time showing your learning progress
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    {chartData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 20, right: 15, left: 10, bottom: 25 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={10}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <ReferenceLine y={70} stroke="var(--color-success)" strokeOpacity={0.3} strokeDasharray="3 3" />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-xs">
                                                        <div className="font-medium">{data.category}</div>
                                                        <div className="text-xs text-muted-foreground">{data.date}</div>
                                                        <div className="mt-1 font-medium text-primary">
                                                            Score: {data.score}%
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        name="Score"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    {trendLineData.length > 0 && (
                                        <Line
                                            type="monotone"
                                            data={trendLineData}
                                            dataKey="trendScore"
                                            name="Trend"
                                            strokeWidth={2}
                                            stroke="var(--color-success)"
                                            dot={false}
                                            activeDot={false}
                                            strokeDasharray="5 5"
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">Complete quizzes to see your progress over time</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Helper function to calculate a simple trend line
function calculateTrendLine(data: any[]) {
    const n = data.length;

    // Simple linear regression
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += data[i].score;
        sumXY += i * data[i].score;
        sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate trend line data
    return data.map((point, index) => ({
        date: point.date,
        trendScore: intercept + slope * index
    }));
}