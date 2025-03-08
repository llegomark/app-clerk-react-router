// app/components/footer.tsx
import React from 'react';
import { BookOpenIcon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t py-4 text-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="size-4 text-primary" />
            <span className="font-semibold">NQESH Reviewer Pro</span>
          </div>
          <p className="text-xs text-muted-foreground">Empower your leadership journey with comprehensive preparation tools</p>
          <p className="text-xs text-muted-foreground">© 2025 All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}