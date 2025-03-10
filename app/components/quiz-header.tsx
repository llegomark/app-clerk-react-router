import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface QuizHeaderProps {
    title: string;
}

export function QuizHeader({ title }: QuizHeaderProps) {
    return (
        <div className="max-w-2xl mx-auto px-1 mb-5">
            <div className="flex items-center justify-between">
                <div className="w-8"></div> {/* Empty space for balance */}
                <h2 className="text-sm font-medium text-foreground text-center">{title}</h2>
                <div className="w-8"></div> {/* Empty space for balance */}
            </div>
        </div>
    );
}