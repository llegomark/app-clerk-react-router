// app/components/category-card.tsx
import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import type { Category } from '~/types';

interface CategoryCardProps {
  category: Omit<Category, 'questions'>;
  onSelect: (id: number) => void;
  isLoading?: boolean;
}

export function CategoryCard({ category, onSelect, isLoading = false }: CategoryCardProps) {
  const handleSelect = () => {
    onSelect(category.id);
  };
  
  return (
    <Card className="transition-colors hover:border-primary/20 hover:bg-accent/5">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl sm:text-3xl" aria-hidden="true">
            {category.icon}
          </div>
        </div>
        <CardTitle className="text-base sm:text-lg mt-2">{category.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-1">
          {category.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 px-4 sm:px-6">
        <div className="h-12 sm:h-16 overflow-hidden text-xs sm:text-sm text-muted-foreground">
          {category.description}
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4 px-4 sm:px-6">
        <Button 
          variant="default" 
          className="w-full gap-1 cursor-pointer"
          onClick={handleSelect}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Start Quiz'}
          {!isLoading && <ArrowRightIcon className="size-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}