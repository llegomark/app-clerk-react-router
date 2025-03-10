// app/components/dashboard/category-performance-chart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';

interface CategoryData {
    categoryId: number;
    categoryName: string;
    attempts: number;
    averagePercentage: number;
    bestScore: number;
    overallPercentage: number;
}

interface CategoryPerformanceChartProps {
    categoryData: CategoryData[];
}

export function CategoryPerformanceChart({ categoryData }: CategoryPerformanceChartProps) {
    // Sort categories by performance for better visualization
    const sortedData = [...categoryData].sort((a, b) => b.overallPercentage - a.overallPercentage);

    // Limit to top categories if there are many
    const displayData = sortedData.slice(0, 8);

    // Chart configuration
    const chartConfig = {
        average: {
            label: 'Average Score',
            color: 'var(--color-primary)'
        },
        best: {
            label: 'Best Score',
            color: 'var(--color-success)'
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                    Your performance across different quiz categories
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    {displayData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={displayData}
                                    layout="vertical"
                                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis
                                        type="number"
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="categoryName"
                                        width={120}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        formatter={(value) => {
                                            // Handle different value types
                                            const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                                            return [`${isNaN(numValue) ? value : numValue.toFixed(1)}%`, ''];
                                        }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-xs">
                                                        <div className="font-medium">{data.categoryName}</div>
                                                        <div className="text-xs text-muted-foreground">{data.attempts} attempts</div>
                                                        <div className="mt-1 grid gap-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-sm text-primary">Average:</span>
                                                                <span className="font-medium">{data.averagePercentage.toFixed(1)}%</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-sm text-success">Best:</span>
                                                                <span className="font-medium">{data.bestScore.toFixed(1)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="averagePercentage"
                                        name="Average Score"
                                        fill="var(--color-primary)"
                                        radius={[0, 4, 4, 0]}
                                        barSize={20}
                                    >
                                        <LabelList
                                            dataKey="averagePercentage"
                                            position="right"
                                            formatter={(value: number) => `${value.toFixed(0)}%`}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">Complete quizzes to see your category performance</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}