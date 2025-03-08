// app/components/quiz-header.tsx
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
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

interface QuizHeaderProps {
    title: string;
    onExit: () => void;
}

export function QuizHeader({ title, onExit }: QuizHeaderProps) {
    // Function to handle the exit confirmation
    const handleConfirmExit = () => {
        // Call the provided onExit function
        onExit();
    };

    return (
        <div className="max-w-2xl mx-auto px-1 mb-5">
            <div className="flex items-center justify-between">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer text-muted-foreground hover:text-foreground h-8 px-2"
                        >
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Exit Quiz?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Your progress will be lost.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <Button
                                variant="destructive"
                                onClick={handleConfirmExit}
                                className="cursor-pointer"
                            >
                                Exit
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <h2 className="text-sm font-medium text-foreground text-center">{title}</h2>
                <div className="w-8"></div> {/* Empty space for balance */}
            </div>
        </div>
    );
}