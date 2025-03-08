// app/components/user-progress-chart.tsx
import {
    ChartContainer
} from '~/components/ui/chart';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine
} from 'recharts';
import type { RecentQuizResult } from '~/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { format } from 'date-fns';

interface UserProgressChartProps {
    results: RecentQuizResult[];
    currentCategoryId?: number;
}

export function UserProgressChart({ results, currentCategoryId }: UserProgressChartProps) {
    // Return early if no results
    if (!results || results.length === 0) {
        return null;
    }

    // Format the data for the chart
    const chartData = results.map(result => {
        // Calculate percentage score
        const percentageScore = ((result.score / result.totalQuestions) * 100).toFixed(1);
        // Format date to be readable
        const formattedDate = format(new Date(result.completedAt), 'MMM d');

        return {
            date: formattedDate,
            score: parseFloat(percentageScore),
            category: result.categoryName,
            categoryId: result.categoryId,
            // Is this the current category that was just completed?
            isCurrent: result.categoryId === currentCategoryId
        };
    }).reverse(); // Reverse to show chronological order

    // Determine if we have enough results to show a meaningful chart
    if (chartData.length < 2) {
        // Maybe don't show the chart if there's only one result?
        // However, for this implementation we'll show even a single result
    }

    // Chart configuration
    const chartConfig = {
        score: {
            label: 'Score (%)',
            color: 'var(--color-primary)'
        },
        currentCategory: {
            color: 'var(--color-success)'
        },
        otherCategory: {
            color: 'var(--color-muted-foreground)'
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Progress</CardTitle>
                <CardDescription>
                    Track your quiz performance over time
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-64">
                    <ChartContainer
                        config={chartConfig}
                        className="h-full w-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 15, left: 0, bottom: 5 }}>
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
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
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
                                    activeDot={{ r: 6 }}
                                    dot={(props) => {
                                        // Special styling for current category points
                                        const isCurrent = props.payload.isCurrent;
                                        return (
                                            <circle
                                                cx={props.cx}
                                                cy={props.cy}
                                                r={isCurrent ? 5 : 4}
                                                stroke={isCurrent ? "var(--color-success)" : "var(--color-primary)"}
                                                strokeWidth={isCurrent ? 2 : 1}
                                                fill={isCurrent ? "var(--color-success)" : "white"}
                                            />
                                        );
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}