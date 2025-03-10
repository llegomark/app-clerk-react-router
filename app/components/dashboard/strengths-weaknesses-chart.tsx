// app/components/dashboard/strengths-weaknesses-chart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface StrengthData {
    category: string;
    strength: number;
    correctAnswers: number;
    totalAnswers: number;
}

interface StrengthsWeaknessesChartProps {
    strengths: StrengthData[];
}

export function StrengthsWeaknessesChart({ strengths }: StrengthsWeaknessesChartProps) {
    // Sort and limit to top 6 categories for better visualization
    const displayData = [...strengths]
        .sort((a, b) => a.category.localeCompare(b.category))
        .slice(0, 6)
        .map(item => ({
            category: item.category,
            strength: Math.round(item.strength),
            correctAnswers: item.correctAnswers,
            totalAnswers: item.totalAnswers
        }));

    // Add missing categories if less than 3
    if (displayData.length < 3) {
        const placeholders = ['Knowledge', 'Application', 'Analysis'];
        for (let i = displayData.length; i < 3; i++) {
            displayData.push({
                category: placeholders[i],
                strength: 0,
                correctAnswers: 0,
                totalAnswers: 0
            });
        }
    }

    // Chart configuration
    const chartConfig = {
        strength: {
            label: 'Proficiency',
            color: 'var(--color-primary)'
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Strengths & Weaknesses</CardTitle>
                <CardDescription>
                    Your performance proficiency across categories
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    {displayData.some(item => item.strength > 0) ? (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={displayData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="category" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar
                                        name="Proficiency"
                                        dataKey="strength"
                                        stroke="var(--color-primary)"
                                        fill="var(--color-primary)"
                                        fillOpacity={0.4}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="font-medium">{data.category}</div>
                                                        <div className="mt-1 grid gap-1 text-sm">
                                                            <div>Proficiency: <span className="font-medium">{data.strength}%</span></div>
                                                            <div>Correct: <span className="font-medium">{data.correctAnswers}/{data.totalAnswers}</span></div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">Complete quizzes to see your strengths and weaknesses</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}