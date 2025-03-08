// app/components/flash-card-controls.tsx
import { Button } from '~/components/ui/button';
import { Progress } from '~/components/ui/progress';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ShuffleIcon,
    ListIcon
} from 'lucide-react';

interface FlashCardControlsProps {
    currentIndex: number;
    totalCards: number;
    onNext: () => void;
    onPrevious: () => void;
    onShuffle: () => void;
    onShowAll: () => void;
}

export function FlashCardControls({
    currentIndex,
    totalCards,
    onNext,
    onPrevious,
    onShuffle,
    onShowAll
}: FlashCardControlsProps) {
    // Calculate progress percentage
    const progressValue = ((currentIndex + 1) / totalCards) * 100;

    return (
        <div className="w-full max-w-md mx-auto mt-4 px-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
                <span>Card {currentIndex + 1} of {totalCards}</span>
                <span>{Math.round(progressValue)}% complete</span>
            </div>

            <Progress value={progressValue} className="h-1 w-full mb-4" />

            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevious}
                    className="cursor-pointer h-9 px-3 border-border/50"
                >
                    <ArrowLeftIcon className="size-3.5 mr-1" />
                    <span className="text-xs">Previous</span>
                </Button>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onShuffle}
                        className="cursor-pointer gap-1 h-9 border-border/50"
                    >
                        <ShuffleIcon className="size-3.5" />
                        <span className="text-xs sr-only sm:not-sr-only">Shuffle</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onShowAll}
                        className="cursor-pointer gap-1 h-9 border-border/50"
                    >
                        <ListIcon className="size-3.5" />
                        <span className="text-xs sr-only sm:not-sr-only">List</span>
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onNext}
                    className="cursor-pointer h-9 px-3 border-border/50"
                >
                    <span className="text-xs">Next</span>
                    <ArrowRightIcon className="size-3.5 ml-1" />
                </Button>
            </div>
        </div>
    );
}