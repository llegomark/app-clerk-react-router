// app/components/timer.tsx
import React, { useEffect, useState } from 'react';
import { cn } from '~/lib/utils';
import { Progress } from '~/components/ui/progress';

interface TimerProps {
  duration: number; // duration in seconds
  isRunning: boolean;
  onTimeUp: () => void;
  onTimeUpdate?: (timeRemaining: number) => void;
  key?: string | number; // Add key prop to force re-creation
}

export function Timer({ duration, isRunning, onTimeUp, onTimeUpdate }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);

  // Reset timer when duration changes or when isRunning becomes true
  useEffect(() => {
    setTimeRemaining(duration);
    setIsWarning(false);
  }, [duration, isRunning]);

  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prevTime) => {
          const newTime = prevTime - 1;
          
          // Set warning state when 30 seconds or less remain
          if (newTime <= 30 && !isWarning) {
            setIsWarning(true);
          }
          
          // Update parent component with current time
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }
          
          // Time's up
          if (newTime <= 0) {
            clearInterval(interval);
            onTimeUp();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
    
    // If timer is paused, make sure we clean up the interval
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining, onTimeUp, onTimeUpdate, isWarning]);

  // Format time as M:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressValue = (timeRemaining / duration) * 100;

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-sm">Time: {formatTime(timeRemaining)}</span>
      </div>
      <Progress 
        value={progressValue} 
        className={cn(
          "h-2 w-full",
          isWarning ? "bg-muted progress-indicator:bg-destructive" : "bg-muted progress-indicator:bg-primary"
        )}
      />
    </div>
  );
}