// app/components/protected-route.tsx
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/react-router';
import { SignInPrompt } from '~/components/sign-in-prompt';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isLoaded, isSignedIn } = useUser();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Simple check - just wait for Clerk to load
        if (isLoaded) {
            // Use a small timeout to ensure any state updates are complete
            const timer = setTimeout(() => {
                setIsChecking(false);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isLoaded]);

    // Show loading state when checking auth
    if (!isLoaded || isChecking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2"></div>
                <p className="text-sm text-muted-foreground">
                    {!isLoaded ? "Loading..." : "Verifying access..."}
                </p>
            </div>
        );
    }

    // Render sign-in prompt if user is not authenticated
    if (!isSignedIn) {
        return <SignInPrompt />;
    }

    // Render the protected content
    return <>{children}</>;
}