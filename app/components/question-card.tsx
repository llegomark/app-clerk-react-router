// app/components/question-card.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { ArrowRightIcon, BookOpenIcon, InfoIcon, TimerIcon } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Timer } from './timer';
import { Separator } from '~/components/ui/separator';
import type { Question, UserAnswer } from '~/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer: UserAnswer | undefined;
  isTimerRunning: boolean;
  onAnswer: (selectedOption: number) => void;
  onTimeUp: () => void;
  onNext: () => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  isTimerRunning,
  onAnswer,
  onTimeUp,
  onNext,
}: QuestionCardProps) {
  const hasAnswered = userAnswer !== undefined;
  
  const handleOptionClick = (optionIndex: number) => {
    if (hasAnswered || !isTimerRunning) return;
    onAnswer(optionIndex);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="font-medium">Question {questionNumber} of {totalQuestions}</span>
        </div>
      </div>
      
      <Timer 
        duration={120} // 2 minutes
        isRunning={isTimerRunning}
        onTimeUp={onTimeUp}
      />
      
      <Card className="relative overflow-hidden">
        {!isTimerRunning && !hasAnswered && (
          <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm bg-background/60">
            <div className="text-center p-4 rounded-lg">
              <TimerIcon className="mx-auto size-10 text-destructive mb-2" />
              <h3 className="text-lg font-semibold">Time's Up!</h3>
              <p className="text-muted-foreground mb-4">You didn't answer in time.</p>
              <Button onClick={onNext} className="cursor-pointer">Next Question</Button>
            </div>
          </div>
        )}
        
        <CardHeader className="px-4 py-3">
          <h3 className="text-base font-medium">{question.question}</h3>
        </CardHeader>
        
        <CardContent className="space-y-3 px-4 py-2">
          {question.options.map((option, index) => {
            // Determine if this option is the correct answer
            const isCorrectOption = index === question.correctAnswer;
            // Determine if this is the option the user selected
            const isSelectedOption = userAnswer?.selectedOption === index;
            
            return (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left py-3 px-3 h-auto font-normal",
                  "cursor-pointer",
                  // Show correct answer in green
                  hasAnswered && isCorrectOption && "border-success bg-success/10",
                  // Show incorrect selection in red
                  hasAnswered && isSelectedOption && !isCorrectOption && "border-destructive bg-destructive/10",
                  // Normal hover state for unanswered questions
                  !hasAnswered && "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => handleOptionClick(index)}
                disabled={hasAnswered || !isTimerRunning}
              >
                <span className="text-sm">{option}</span>
              </Button>
            );
          })}
        </CardContent>
        
        {hasAnswered && (
          <>
            <Separator />
            <CardContent className="pt-3 px-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <InfoIcon className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1 text-sm">Explanation</h3>
                    <p className="text-sm text-muted-foreground">
                      {question.explanation}
                    </p>
                  </div>
                </div>
                
                {question.reference && (
                  <div className="flex gap-2">
                    <BookOpenIcon className="size-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1 text-sm">Reference</h3>
                      <p className="text-xs text-muted-foreground">
                        {question.reference.title}
                        {question.reference.url && (
                          <a 
                            href={question.reference.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block text-primary hover:underline mt-1"
                          >
                            View Reference
                          </a>
                        )}
                        {question.reference.copyright && (
                          <span className="block text-xs mt-1">
                            © {question.reference.copyright}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end py-3 px-4">
              <Button 
                size="sm"
                onClick={onNext} 
                className="gap-1 cursor-pointer"
              >
                {questionNumber === totalQuestions ? "See Results" : "Next Question"}
                <ArrowRightIcon className="size-4" />
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}