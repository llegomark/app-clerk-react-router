// app/components/quiz-header.tsx
import React from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '~/components/ui/alert-dialog';

interface QuizHeaderProps {
  title: string;
  onExit: () => void;
}

export function QuizHeader({ title, onExit }: QuizHeaderProps) {
  return (
    <div className="mb-4 border-b pb-3">
      <div className="flex items-center justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="cursor-pointer"
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
              <AlertDialogAction 
                onClick={onExit}
                className="bg-destructive text-destructive-foreground cursor-pointer"
              >
                Exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <h2 className="text-lg font-medium text-center flex-1">{title}</h2>
        <div className="w-8"></div> {/* Empty space for balance */}
      </div>
    </div>
  );
}