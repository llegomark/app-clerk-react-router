// app/components/question-card.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { ArrowRightIcon, BookOpenIcon, InfoIcon, ClockIcon, BookmarkIcon } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Timer } from './timer';
import { Separator } from '~/components/ui/separator';
import { toast } from 'sonner';
import type { Question, UserAnswer } from '~/types';
import {
    addBookmark,
    removeBookmark,
    isQuestionBookmarked
} from '~/lib/bookmark-service';

interface QuestionCardProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    userAnswer: UserAnswer | undefined;
    isTimerRunning: boolean;
    categoryId: number;
    categoryName: string;
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
    categoryId,
    categoryName,
    onAnswer,
    onTimeUp,
    onNext,
}: QuestionCardProps) {
    const hasAnswered = userAnswer !== undefined;
    const [bookmarked, setBookmarked] = useState(false);
    const [isCheckingBookmark, setIsCheckingBookmark] = useState(true);

    // Check if the question is bookmarked when the component mounts or question changes
    useEffect(() => {
        async function checkBookmarkStatus() {
            setIsCheckingBookmark(true);
            const { isBookmarked } = await isQuestionBookmarked(question.id);
            setBookmarked(isBookmarked);
            setIsCheckingBookmark(false);
        }

        checkBookmarkStatus();
    }, [question.id]);

    const handleOptionClick = (optionIndex: number) => {
        if (hasAnswered || !isTimerRunning) return;
        onAnswer(optionIndex);
    };

    const handleTimeUp = () => {
        toast.warning("Time's up!");
        onTimeUp();
    };

    const handleToggleBookmark = async (e: React.MouseEvent) => {
        // Stop event propagation to prevent it from triggering parent click handlers
        e.stopPropagation();

        if (isCheckingBookmark) return;

        try {
            if (bookmarked) {
                const { success } = await removeBookmark(question.id);
                if (success) {
                    setBookmarked(false);
                    toast.success('Question removed from bookmarks');
                } else {
                    throw new Error('Failed to remove bookmark');
                }
            } else {
                const { success } = await addBookmark(question, categoryId, categoryName);
                if (success) {
                    setBookmarked(true);
                    toast.success('Question added to bookmarks');
                } else {
                    throw new Error('Failed to bookmark question');
                }
            }
        } catch (error) {
            console.error('Bookmark error:', error);
            toast.error('Failed to update bookmark');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            {/* Progress indicator - subtle and less distracting */}
            <div className="flex items-center justify-between px-1 mb-1">
                <div className="text-xs text-muted-foreground">
                    Question {questionNumber} of {totalQuestions}
                </div>
                <div className="w-28">
                    <Timer
                        key={`timer-${question.id}-${isTimerRunning}`}
                        duration={120}
                        isRunning={isTimerRunning}
                        onTimeUp={handleTimeUp}
                    />
                </div>
            </div>

            <Card className="border-border/40 shadow-sm">
                {!isTimerRunning && !hasAnswered && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm bg-background/60">
                        <div className="text-center bg-background p-5 rounded-lg shadow-sm border max-w-xs">
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

                <CardContent className="p-5">
                    {/* Question text with bookmark button */}
                    <div className="mb-6 flex justify-between items-start gap-4">
                        <h2 className="text-base sm:text-base font-medium leading-relaxed text-foreground flex-1">
                            {question.question}
                        </h2>

                        {/* Bookmark button - fixed for better clickability */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "shrink-0 mt-0.5 cursor-pointer z-10",
                                bookmarked ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground hover:text-foreground",
                                isCheckingBookmark && "opacity-50 pointer-events-none"
                            )}
                            onClick={handleToggleBookmark}
                            title={bookmarked ? "Remove bookmark" : "Bookmark this question"}
                            disabled={isCheckingBookmark}
                        >
                            <BookmarkIcon className="size-5" />
                        </Button>
                    </div>

                    {/* Options - cleaner design with better hover states */}
                    <div className="space-y-2.5">
                        {question.options.map((option, index) => {
                            const isCorrectOption = index === question.correctAnswer;
                            const isSelectedOption = userAnswer?.selectedOption === index;
                            const isCorrectAnswer = hasAnswered && isCorrectOption;
                            const isIncorrectAnswer = hasAnswered && isSelectedOption && !isCorrectOption;

                            return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left px-4 py-3 h-auto text-sm font-normal break-words whitespace-normal",
                                        "border shadow-xs transition-colors",
                                        // Interactive states (when not answered)
                                        !hasAnswered && "cursor-pointer hover:border-primary/50 hover:text-foreground hover:bg-accent/50 focus-visible:border-primary",
                                        // Correct answer styling
                                        isCorrectAnswer && "border-success/70 bg-success/10 text-foreground",
                                        // Incorrect selection styling
                                        isIncorrectAnswer && "border-destructive/70 bg-destructive/10 text-foreground"
                                    )}
                                    onClick={() => handleOptionClick(index)}
                                    disabled={hasAnswered || !isTimerRunning}
                                >
                                    <div className="flex items-start gap-2">
                                        <span>{option}</span>
                                    </div>

                                    {/* Subtle indicators for correct/incorrect answers */}
                                    {isCorrectAnswer && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}

                                    {isIncorrectAnswer && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>

                {hasAnswered && (
                    <>
                        <Separator />
                        <CardContent className="pt-4 pb-4 px-5 bg-accent/40">
                            <div className="space-y-3">
                                <div className="flex gap-2.5 p-3 bg-background rounded-md border border-border/50">
                                    <InfoIcon className="size-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium mb-1 text-xs">Explanation</h3>
                                        <p className="text-muted-foreground text-xs break-words">
                                            {question.explanation}
                                        </p>
                                    </div>
                                </div>

                                {question.reference && (
                                    <div className="flex gap-2.5 p-3 bg-background rounded-md border border-border/50">
                                        <BookOpenIcon className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium mb-1 text-xs">Reference</h3>
                                            <p className="text-xs text-muted-foreground break-words">
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

                        <CardFooter className="flex justify-end py-3 px-5 bg-accent/20">
                            <Button
                                size="sm"
                                onClick={onNext}
                                className="gap-1.5 cursor-pointer"
                            >
                                {questionNumber === totalQuestions ? "See Results" : "Next Question"}
                                <ArrowRightIcon className="size-3.5" />
                            </Button>
                        </CardFooter>
                    </>
                )}
            </Card>
        </div>
    );
}