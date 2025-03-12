// app/components/dashboard/question-difficulty-chart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Badge } from '~/components/ui/badge';
import { useUser } from '@clerk/react-router';
import { useDetailedQuizAnswers } from '~/hooks/use-dashboard-queries';
import { useState, useEffect } from 'react';

interface QuestionData {
    questionId: number;
    correctCount: number;
    totalCount: number;
    successRate: number;
    categoryName: string;
}

export function QuestionDifficultyChart() {
    const { user } = useUser();
    const { data: answers, isPending } = useDetailedQuizAnswers(user?.id || '');
    const [questionData, setQuestionData] = useState<QuestionData[]>([]);

    useEffect(() => {
        if (!answers) return;

        // Group by question ID
        const questionMap = new Map<number, {
            questionId: number;
            correctCount: number;
            totalCount: number;
            categoryName: string;
        }>();

        answers.forEach(answer => {
            const questionId = answer.questionId;

            if (!questionMap.has(questionId)) {
                questionMap.set(questionId, {
                    questionId,
                    correctCount: 0,
                    totalCount: 0,
                    categoryName: answer.categoryName
                });
            }

            const question = questionMap.get(questionId)!;
            question.totalCount += 1;
            if (answer.isCorrect) {
                question.correctCount += 1;
            }
        });

        // Calculate success rate for each question
        const processedData = Array.from(questionMap.values())
            .filter(q => q.totalCount >= 2) // Only include questions attempted multiple times
            .map(q => ({
                ...q,
                successRate: (q.correctCount / q.totalCount) * 100
            }))
            .sort((a, b) => a.successRate - b.successRate) // Sort by success rate ascending
            .slice(0, 10); // Get top 10 most difficult questions

        setQuestionData(processedData);
    }, [answers]);

    // Chart configuration
    const chartConfig = {
        successRate: {
            label: 'Success Rate',
            color: 'var(--color-primary)'
        }
    };

    // Get color based on success rate
    const getBarColor = (rate: number) => {
        if (rate < 40) return 'var(--color-destructive)';
        if (rate < 70) return 'var(--color-chart-1)';
        return 'var(--color-success)';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Most Challenging Questions</CardTitle>
                <CardDescription>
                    Questions with the lowest success rates
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    {isPending ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        </div>
                    ) : questionData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={questionData}
                                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                                    <XAxis
                                        type="number"
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="questionId"
                                        tick={(props) => {
                                            const { x, y, payload } = props;
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={-5} y={0} dy={4} textAnchor="end" fontSize={12}>
                                                        Q{payload.value}
                                                    </text>
                                                </g>
                                            );
                                        }}
                                        width={40}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-xs">
                                                        <div className="font-medium">Question {data.questionId}</div>
                                                        <div className="mb-1">
                                                            <Badge variant="outline" className="mt-1">{data.categoryName}</Badge>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4 text-sm">
                                                            <span>Success Rate:</span>
                                                            <span className="font-medium">{data.successRate.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4 text-sm">
                                                            <span>Attempts:</span>
                                                            <span className="font-medium">{data.totalCount}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4 text-sm">
                                                            <span>Correct:</span>
                                                            <span className="font-medium">{data.correctCount}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="successRate"
                                        name="Success Rate"
                                        label={{
                                            position: 'right',
                                            formatter: (value: number) => `${value.toFixed(0)}%`
                                        }}
                                    >
                                        {questionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getBarColor(entry.successRate)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">Complete more quizzes to identify challenging questions</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}