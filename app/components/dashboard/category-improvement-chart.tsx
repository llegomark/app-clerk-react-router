// app/components/dashboard/category-improvement-chart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getDetailedQuizAnswers } from '~/lib/supabase-dashboard';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/react-router';
import { format } from 'date-fns';

interface CategoryImprovementData {
    dateKey: string;
    date: string;
    [categoryId: string]: any;
}

export function CategoryImprovementChart() {
    const { user } = useUser();
    const [data, setData] = useState<CategoryImprovementData[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string, color: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Colors for different categories
    const categoryColors = [
        'var(--color-primary)',
        'var(--color-success)',
        'var(--color-chart-1)',
        'var(--color-chart-2)',
        'var(--color-chart-3)',
        'var(--color-chart-4)'
    ];

    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            setIsLoading(true);
            try {
                // Get detailed answer data
                const answers = await getDetailedQuizAnswers(user.id);

                // Group answers by quiz (completed date) and category
                const quizCategoryMap = new Map();

                answers.forEach(answer => {
                    const quizDate = answer.completedAt.split('T')[0]; // YYYY-MM-DD
                    const categoryId = answer.categoryId.toString();
                    const categoryName = answer.categoryName;

                    const quizCategoryKey = `${quizDate}_${categoryId}`;

                    if (!quizCategoryMap.has(quizCategoryKey)) {
                        quizCategoryMap.set(quizCategoryKey, {
                            quizDate,
                            categoryId,
                            categoryName,
                            correctCount: 0,
                            totalCount: 0
                        });
                    }

                    const data = quizCategoryMap.get(quizCategoryKey);
                    data.totalCount += 1;
                    if (answer.isCorrect) {
                        data.correctCount += 1;
                    }
                });

                // Get unique categories with assigned colors
                const uniqueCategories = Array.from(
                    new Set(
                        Array.from(quizCategoryMap.values()).map(item =>
                            ({ id: item.categoryId, name: item.categoryName })
                        )
                    )
                ).map((cat, index) => ({
                    ...cat,
                    color: categoryColors[index % categoryColors.length]
                }));

                setCategories(uniqueCategories);

                // Group by date for the chart
                const dateMap = new Map();

                for (const data of quizCategoryMap.values()) {
                    if (!dateMap.has(data.quizDate)) {
                        dateMap.set(data.quizDate, {
                            dateKey: data.quizDate,
                            date: format(new Date(data.quizDate), 'MMM d, yyyy')
                        });
                    }

                    const dateData = dateMap.get(data.quizDate);
                    // Store percentage for this category on this date
                    dateData[data.categoryId] = (data.correctCount / data.totalCount) * 100;
                    dateData[`${data.categoryId}_name`] = data.categoryName;
                }

                // Convert to array and sort by date
                const chartData = Array.from(dateMap.values());
                chartData.sort((a, b) => new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime());

                setData(chartData);
            } catch (err) {
                console.error('Error fetching category improvement data:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [user]);

    // Prepare chart config
    const chartConfig: Record<string, { label: string, color: string }> = categories.reduce((config, category) => {
        config[category.id] = {
            label: category.name,
            color: category.color
        };
        return config;
    }, {} as Record<string, { label: string, color: string }>);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Category Improvement</CardTitle>
                <CardDescription>
                    Performance across categories over time
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
                                    margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="date" />
                                    <YAxis
                                        domain={[0, 100]}
                                        label={{
                                            value: 'Percentage Correct',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fontSize: '12px' }
                                        }}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip
                                        formatter={(value, name, props) => {
                                            // Get the friendly name from the data
                                            const categoryName = props.payload[`${name}_name`] || name;
                                            return [`${Number(value).toFixed(1)}%`, categoryName];
                                        }}
                                    />
                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="top"
                                        align="center"
                                        wrapperStyle={{ paddingTop: 0 }}
                                    />

                                    {/* Create a line for each category */}
                                    {categories.map((category) => (
                                        <Line
                                            key={category.id}
                                            type="monotone"
                                            dataKey={category.id}
                                            name={category.name}
                                            stroke={category.color}
                                            activeDot={{ r: 6 }}
                                            connectNulls={true}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">Complete more category quizzes to see improvement trends</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}