// app/components/dashboard/time-metrics-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Clock3Icon, ZapIcon, HourglassIcon } from 'lucide-react';

interface TimeDistribution {
    bucket: string;
    count: number;
}

interface TimeMetrics {
    averageTimeRemaining: number;
    fastestAnswer: number;
    slowestAnswer: number;
    timeDistribution: TimeDistribution[];
}

interface TimeMetricsCardProps {
    timeMetrics: TimeMetrics;
}

export function TimeMetricsCard({ timeMetrics }: TimeMetricsCardProps) {
    // Format time from seconds to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Process data for pie chart
    const pieData = timeMetrics.timeDistribution
        .filter(item => item.count > 0)
        .map(item => ({
            name: `${item.bucket} sec`,
            value: item.count
        }));

    // Colors for the pie chart
    const COLORS = [
        'var(--color-success)',
        'var(--color-chart-1)',
        'var(--color-chart-2)',
        'var(--color-chart-3)',
        'var(--color-chart-4)',
        'var(--color-destructive)'
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Time Performance</CardTitle>
                <CardDescription>
                    Analysis of your answer timing and speed
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Clock3Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Average Time Left</p>
                            <p className="text-lg font-medium">
                                {formatTime(timeMetrics.averageTimeRemaining)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                        <div className="bg-success/10 p-2 rounded-full">
                            <ZapIcon className="h-5 w-5 text-success" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Fastest Answer</p>
                            <p className="text-lg font-medium">
                                {formatTime(timeMetrics.fastestAnswer)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                        <div className="bg-destructive/10 p-2 rounded-full">
                            <HourglassIcon className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Slowest Answer</p>
                            <p className="text-lg font-medium">
                                {formatTime(timeMetrics.slowestAnswer)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="h-64">
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent, value }) => {
                                        // Only show labels for segments that are significant enough (e.g., > 5%)
                                        if (percent < 0.05) return null;
                                        return `${name} (${(percent * 100).toFixed(0)}%)`;
                                    }}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [`${value} answers`, name]}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            const percentage = ((data.value / pieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <div className="font-medium">{data.name}</div>
                                                    <div className="mt-1 grid gap-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs">Answers:</span>
                                                            <span className="font-medium">{data.value}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs">Percentage:</span>
                                                            <span className="font-medium">{percentage}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    wrapperStyle={{ paddingTop: 20 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">Complete quizzes to see your time distribution</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}