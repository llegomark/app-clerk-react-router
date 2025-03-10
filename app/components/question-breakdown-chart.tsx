// app/components/question-breakdown-chart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList, Cell } from 'recharts';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { UserAnswer } from '~/types';

interface QuestionBreakdownChartProps {
    userAnswers: UserAnswer[];
    totalQuestions: number;
}

interface ChartData {
    name: string;
    value: number;
    percentage: number;
    color: string;
    label: string;
}

export function QuestionBreakdownChart({ userAnswers, totalQuestions }: QuestionBreakdownChartProps) {
    // Calculate statistics
    const answered = userAnswers.length;
    const unanswered = totalQuestions - answered;
    const correct = userAnswers.filter(a => a.isCorrect).length;
    const incorrect = answered - correct;

    // Calculate percentages for the stats
    const correctPercentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
    const incorrectPercentage = totalQuestions > 0 ? (incorrect / totalQuestions) * 100 : 0;
    const unansweredPercentage = totalQuestions > 0 ? (unanswered / totalQuestions) * 100 : 0;

    // Format the data for the horizontal bar chart
    const chartData: ChartData[] = [
        {
            name: 'Correct',
            value: correct,
            percentage: correctPercentage,
            color: 'var(--color-success)',
            label: `${correct} (${correctPercentage.toFixed(0)}%)`
        },
        {
            name: 'Incorrect',
            value: incorrect,
            percentage: incorrectPercentage,
            color: 'var(--color-destructive)',
            label: `${incorrect} (${incorrectPercentage.toFixed(0)}%)`
        }
    ];

    // Only add unanswered if there are any
    if (unanswered > 0) {
        chartData.push({
            name: 'Unanswered',
            value: unanswered,
            percentage: unansweredPercentage,
            color: 'var(--color-muted)',
            label: `${unanswered} (${unansweredPercentage.toFixed(0)}%)`
        });
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Question Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="flex flex-col gap-6">
                    {/* Horizontal Bar Chart */}
                    <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                            >
                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fill: 'var(--color-foreground)' }}
                                    width={90}
                                />
                                <Tooltip
                                    formatter={(value, name, props) => {
                                        if (name === 'percentage') {
                                            return [`${Number(value).toFixed(1)}%`, 'Percentage'];
                                        }
                                        return [`${value} question${value !== 1 ? 's' : ''}`, name];
                                    }}
                                    contentStyle={{
                                        background: 'var(--color-background)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '6px',
                                        padding: '8px 12px'
                                    }}
                                />
                                <Bar
                                    dataKey="percentage"
                                    radius={[0, 4, 4, 0]}
                                    barSize={24}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                    <LabelList
                                        dataKey="label"
                                        position="right"
                                        fill="var(--color-foreground)"
                                        style={{ fontWeight: 500, fontSize: '0.8rem' }}
                                        offset={10}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stats display */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-start gap-3 bg-success/5 p-3 rounded-md border border-success/20">
                            <CheckCircleIcon className="size-4 text-success shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <div className="mb-1">
                                    <span className="text-sm font-medium">Correct</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {correctPercentage >= 80
                                        ? "Excellent work!"
                                        : correctPercentage >= 60
                                            ? "Good job!"
                                            : "Keep practicing!"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-destructive/5 p-3 rounded-md border border-destructive/20">
                            <XCircleIcon className="size-4 text-destructive shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <div className="mb-1">
                                    <span className="text-sm font-medium">Incorrect</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {incorrect === 0
                                        ? "Perfect score!"
                                        : incorrect <= 2
                                            ? "Just a few mistakes."
                                            : "Review these questions."}
                                </p>
                            </div>
                        </div>

                        {unanswered > 0 && (
                            <div className="flex items-start gap-3 bg-muted/20 p-3 rounded-md border border-muted/30">
                                <MinusCircleIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="mb-1">
                                        <span className="text-sm font-medium">Unanswered</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Try to answer all questions next time.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Insights */}
                {userAnswers.length > 0 && (
                    <div className="mt-5 pt-3 border-t text-sm">
                        <p className="text-xs font-medium mb-1">Insights:</p>
                        <p className="text-xs text-muted-foreground">
                            {correctPercentage >= 80
                                ? "Excellent performance! You demonstrate strong mastery of this topic."
                                : correctPercentage >= 60
                                    ? "Good performance! Focus on the specific areas where you made mistakes."
                                    : unansweredPercentage > 20
                                        ? "Try to answer all questions, even if you're unsure. This helps with learning."
                                        : "Review the incorrect answers and try again to improve your score."
                            }
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}