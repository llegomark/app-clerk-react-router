// app/components/category-card.tsx
import { useUser } from '@clerk/react-router';
import { toast } from 'sonner';
import { Card, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import type { Category } from '~/types';

interface CategoryCardProps {
    category: Omit<Category, 'questions'>;
    onSelect: (id: number) => void;
    onHover?: (id: number) => void; // Add hover handler for prefetching
    isLoading?: boolean;
}

export function CategoryCard({ category, onSelect, onHover, isLoading = false }: CategoryCardProps) {
    const { isSignedIn } = useUser();

    const handleSelect = () => {
        if (isLoading) return;

        // Check if user is signed in before starting a quiz
        if (!isSignedIn) {
            toast.error("Already have an account? Sign in to start NQESH Reviewer Pro!");
            return;
        }

        onSelect(category.id);
    };

    const handleHover = () => {
        if (onHover && !isLoading && isSignedIn) {
            onHover(category.id);
        }
    };

    return (
        <Card
            className={cn(
                "transition-all duration-200 hover:border-primary/40 hover:bg-accent/10 hover:shadow-md cursor-pointer",
                "relative overflow-hidden",
                isLoading && "pointer-events-none opacity-80"
            )}
            onClick={handleSelect}
            onMouseEnter={handleHover} // Add hover event
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        <p className="text-sm font-medium">Loading...</p>
                    </div>
                </div>
            )}

            <CardHeader className="pb-5 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="text-2xl sm:text-3xl" aria-hidden="true">
                        {category.icon}
                    </div>
                </div>
                <CardTitle className="text-base sm:text-lg mt-2">{category.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                    {category.description}
                </CardDescription>
            </CardHeader>
        </Card>
    );
}