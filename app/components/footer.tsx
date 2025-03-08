// app/components/footer.tsx
import { BookOpenIcon } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t py-4 text-center">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-xs text-muted-foreground">© {currentYear} Eduventure Web Development Services. All rights reserved</p>
                </div>
            </div>
        </footer>
    );
}
