// app/components/sign-in-prompt.tsx
import { SignInButton } from "@clerk/react-router";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export function SignInPrompt() {
    return (
        <div className="min-h-[calc(100vh-10rem)] bg-background py-6 px-4">
            <Card className="max-w-md mx-auto my-8">
                <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                        <AlertCircleIcon className="size-8 text-primary mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            You need to sign in to access this feature. Sign in to track your progress and save your results.
                        </p>
                        <SignInButton mode="modal">
                            <Button className="cursor-pointer">
                                Sign In
                            </Button>
                        </SignInButton>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}