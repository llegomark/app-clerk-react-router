// app/components/question-card.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { ArrowRightIcon, BookOpenIcon, InfoIcon, ClockIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Timer } from './timer';
import { Progress } from '~/components/ui/progress';
import { Separator } from '~/components/ui/separator';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '~/components/ui/alert-dialog';
import type { Question, ShuffledQuestion, UserAnswer } from '~/types';

interface QuestionCardProps {
    question: Question | ShuffledQuestion;
    questionNumber: number;
    totalQuestions: number;
    userAnswer: UserAnswer | undefined;
    isTimerRunning: boolean;
    categoryId: number;
    categoryName: string;
    onAnswer: (selectedOption: number, timeRemaining: number) => void;  // Updated to include timeRemaining
    onTimeUp: () => void;
    onNext: () => void;
    onExit?: () => void; // Added exit prop
}

export function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    userAnswer,
    isTimerRunning,
    categoryId,
    categoryName,
    onAnswer,
    onTimeUp,
    onNext,
    onExit,
}: QuestionCardProps) {
    const hasAnswered = userAnswer !== undefined;
    const [currentTimeRemaining, setCurrentTimeRemaining] = useState(120); // Track current time remaining

    // Handle time updates from the Timer component
    const handleTimeUpdate = (timeRemaining: number) => {
        setCurrentTimeRemaining(timeRemaining);
    };

    const handleOptionClick = (optionIndex: number) => {
        if (hasAnswered || !isTimerRunning) return;
        onAnswer(optionIndex, currentTimeRemaining); // Pass the actual time remaining
    };

    const handleTimeUp = () => {
        toast.warning("Time's up!");
        onTimeUp();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Progress indicator */}
            <div className="space-y-2 px-1 mb-6">
                <div className="flex items-center justify-between">
                    <div className="text-xs font-medium">
                        Question {questionNumber} of {totalQuestions}
                    </div>
                    <Timer
                        key={`timer-${question.id}-${isTimerRunning}`}
                        duration={120}
                        isRunning={isTimerRunning}
                        onTimeUp={handleTimeUp}
                        onTimeUpdate={handleTimeUpdate} // Pass the time update handler
                    />
                </div>
                <Progress
                    value={(currentTimeRemaining / 120) * 100}
                    className={cn(
                        "h-2.5",
                        currentTimeRemaining <= 10
                            ? "bg-background [&>div]:bg-destructive"
                            : currentTimeRemaining <= 30
                                ? "bg-background [&>div]:bg-amber-500"
                                : "bg-background [&>div]:bg-primary"
                    )}
                />
            </div>

            <Card className="border-border/40 shadow-xs">
                {!isTimerRunning && !hasAnswered && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm bg-background/60">
                        <div className="text-center bg-background p-5 rounded-lg shadow-xs border max-w-xs">
                            <div className="text-destructive mb-3">
                                <ClockIcon className="h-7 w-7 mx-auto" />
                            </div>
                            <h3 className="text-base font-medium mb-2">Time's Up</h3>
                            <p className="text-sm text-muted-foreground mb-4">You didn't answer in time.</p>
                            <Button onClick={onNext} className="cursor-pointer" size="sm">
                                Next Question
                            </Button>
                        </div>
                    </div>
                )}

                <CardContent className="p-6">
                    {/* Question text */}
                    <div className="mb-8">
                        <h2 className="text-lg font-medium leading-relaxed">
                            {question.question}
                        </h2>
                    </div>

                    {/* Options - improved styling to match quiz.tsx */}
                    <div className="space-y-3">
                        {question.options.map((option, index) => {
                            // Check if we're dealing with a shuffled question
                            const isCorrectOption = 'optionIndexMap' in question ?
                                question.optionIndexMap.get(index) === question.correctAnswer :
                                index === question.correctAnswer;

                            const isSelectedOption = userAnswer?.selectedOption === index;
                            const isCorrectAnswer = hasAnswered && isCorrectOption;
                            const isIncorrectAnswer = hasAnswered && isSelectedOption && !isCorrectOption;

                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center rounded-md overflow-hidden",
                                        hasAnswered && isCorrectOption ? "border-2 border-green-500 bg-green-50" :
                                            hasAnswered && isSelectedOption ? "border-2 border-red-500 bg-red-50" :
                                                hasAnswered ? "border border-gray-200 opacity-70" :
                                                    "border border-gray-200 hover:border-blue-300 cursor-pointer"
                                    )}
                                    onClick={() => handleOptionClick(index)}
                                >
                                    <div
                                        className={cn(
                                            "flex items-start w-full p-3 text-sm",
                                            !hasAnswered && "cursor-pointer"
                                        )}
                                    >
                                        <div className="flex-1">
                                            {option}
                                        </div>

                                        {hasAnswered && isCorrectOption && (
                                            <CheckCircle2Icon className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
                                        )}

                                        {hasAnswered && isSelectedOption && !isCorrectOption && (
                                            <XCircleIcon className="h-4 w-4 text-red-500 ml-2 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>

                {hasAnswered && (
                    <>
                        <Separator />
                        <CardContent className="pt-5 pb-5 px-6">
                            <div className="space-y-4">
                                <div className="flex gap-3 p-4 rounded-md border border-border">
                                    <InfoIcon className="size-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium mb-2 text-sm">Explanation</h3>
                                        <p className="text-foreground text-sm break-words">
                                            {question.explanation}
                                        </p>
                                    </div>
                                </div>

                                {question.reference && (
                                    <div className="flex gap-3 p-4 rounded-md border border-border">
                                        <BookOpenIcon className="size-5 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium mb-2 text-sm">Reference</h3>
                                            <p className="text-sm text-foreground break-words">
                                                {question.reference.title}
                                                {question.reference.url && (
                                                    <a
                                                        href={question.reference.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block text-primary hover:underline mt-1 break-all"
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

                        <CardFooter className="flex justify-between py-4 px-6">
                            {onExit && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="cursor-pointer gap-1.5"
                                        >
                                            Exit Quiz
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Exit Review?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Your progress will be lost.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                            <Button
                                                variant="destructive"
                                                onClick={onExit}
                                                className="cursor-pointer"
                                            >
                                                Exit
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            <div className="ml-auto">
                                <Button
                                    size="sm"
                                    onClick={onNext}
                                    className="gap-1.5 cursor-pointer"
                                >
                                    {questionNumber === totalQuestions ? "See Results" : "Next Question"}
                                    <ArrowRightIcon className="size-3.5" />
                                </Button>
                            </div>
                        </CardFooter>
                    </>
                )}
            </Card>
        </div>
    );
}