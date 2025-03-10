// app/components/footer.tsx
import { BookOpenIcon } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border py-6 text-center bg-background">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center gap-2 text-primary">
                        <BookOpenIcon className="size-4" />
                        <span className="text-sm font-medium">NQESH Reviewer Pro</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                            © {currentYear} Mark Anthony Llego and Eduventure Web Development Services. All rights reserved.
                        </p>
                        <Link
                            to="/copyright"
                            className="text-xs text-primary hover:underline flex items-center gap-1.5 transition-colors"
                        >
                            <span>Copyright Notice</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}