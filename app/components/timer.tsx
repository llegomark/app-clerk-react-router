// app/components/timer.tsx
import { useEffect, useState } from 'react';
import { cn } from '~/lib/utils';
import { Progress } from '~/components/ui/progress';
import { ClockIcon } from 'lucide-react';

interface TimerProps {
    duration: number; // duration in seconds
    isRunning: boolean;
    onTimeUp: () => void;
    onTimeUpdate?: (timeRemaining: number) => void; // New callback for time updates
    key?: string | number; // Add key prop to force re-creation
}

export function Timer({ duration, isRunning, onTimeUp, onTimeUpdate }: TimerProps) {
    const [timeRemaining, setTimeRemaining] = useState(duration);
    const [isWarning, setIsWarning] = useState(false);
    const [isCritical, setIsCritical] = useState(false);

    // Reset timer when duration changes or when isRunning becomes true
    useEffect(() => {
        setTimeRemaining(duration);
        setIsWarning(false);
        setIsCritical(false);
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

                    // Set critical state when 10 seconds or less remain
                    if (newTime <= 10 && !isCritical) {
                        setIsCritical(true);
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
    }, [isRunning, timeRemaining, onTimeUp, onTimeUpdate, isWarning, isCritical]);

    // Format time as M:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressValue = (timeRemaining / duration) * 100;

    return (
        <div className="flex items-center gap-1.5">
            <ClockIcon className={cn(
                "size-3.5",
                isCritical ? "text-destructive" :
                    isWarning ? "text-amber-500" :
                        "text-muted-foreground"
            )} />
            <span className={cn(
                "text-xs font-normal",
                isCritical ? "text-destructive" :
                    isWarning ? "text-amber-500" :
                        "text-muted-foreground"
            )}>
                {formatTime(timeRemaining)}
            </span>
            <Progress
                value={progressValue}
                className={cn(
                    "h-1 w-8",
                    isCritical ? "progress-indicator:bg-destructive" :
                        isWarning ? "progress-indicator:bg-amber-500" :
                            "progress-indicator:bg-primary/50"
                )}
            />
        </div>
    );
}