// app/components/question-breakdown-chart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckIcon, XIcon } from 'lucide-react';
import type { UserAnswer } from '~/types';

interface QuestionBreakdownChartProps {
  userAnswers: UserAnswer[];
  totalQuestions: number;
}

export function QuestionBreakdownChart({ userAnswers, totalQuestions }: QuestionBreakdownChartProps) {
  // Calculate statistics
  const answered = userAnswers.length;
  const unanswered = totalQuestions - answered;
  const correct = userAnswers.filter(a => a.isCorrect).length;
  const incorrect = answered - correct;
  
  // Format the data for the pie chart
  const data = [
    { name: 'Correct', value: correct, color: 'var(--color-success)' },
    { name: 'Incorrect', value: incorrect, color: 'var(--color-destructive)' },
    { name: 'Unanswered', value: unanswered, color: 'var(--color-muted)' }
  ].filter(item => item.value > 0); // Only include non-zero values
  
  // Calculate percentages for the stats
  const correctPercentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
  const incorrectPercentage = totalQuestions > 0 ? (incorrect / totalQuestions) * 100 : 0;
  const unansweredPercentage = totalQuestions > 0 ? (unanswered / totalQuestions) * 100 : 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Question Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          {/* Chart visualization */}
          <div className="h-40 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} questions`, '']}
                  labelFormatter={(label) => label}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Stats display */}
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success"></div>
              <div className="flex justify-between w-full">
                <span className="text-sm">Correct</span>
                <span className="text-sm font-medium">{correct} ({correctPercentage.toFixed(0)}%)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive"></div>
              <div className="flex justify-between w-full">
                <span className="text-sm">Incorrect</span>
                <span className="text-sm font-medium">{incorrect} ({incorrectPercentage.toFixed(0)}%)</span>
              </div>
            </div>
            
            {unanswered > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted"></div>
                <div className="flex justify-between w-full">
                  <span className="text-sm">Unanswered</span>
                  <span className="text-sm font-medium">{unanswered} ({unansweredPercentage.toFixed(0)}%)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}