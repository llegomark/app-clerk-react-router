// app/components/timer.tsx
import { useEffect, useState, useRef } from 'react';
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

    // Use ref for the previous time value to avoid unnecessary effect triggers
    const prevTimeRef = useRef(timeRemaining);

    // Reset timer when duration changes or when isRunning becomes true
    useEffect(() => {
        setTimeRemaining(duration);
        setIsWarning(false);
        setIsCritical(false);
    }, [duration, isRunning]);

    // Effect for time updates to parent - separated from the main timer logic
    useEffect(() => {
        // Only call onTimeUpdate when the time actually changes
        // and not on initial render
        if (prevTimeRef.current !== timeRemaining && onTimeUpdate) {
            onTimeUpdate(timeRemaining);
        }

        // Update the ref with current value
        prevTimeRef.current = timeRemaining;
    }, [timeRemaining, onTimeUpdate]);

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
    }, [isRunning, isWarning, isCritical, onTimeUp]);

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
        </div>
    );
}