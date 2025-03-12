// app/hooks/use-categories.ts
import { useQuery } from '@tanstack/react-query';
import { getCategories, getCategoryWithQuestions } from '~/lib/supabase';
import type { Category } from '~/types';

// Hook for loading the category list
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            try {
                const categoriesData = await getCategories();

                // Debug check to see if data is being returned
                console.log('Categories data loaded:', categoriesData);

                // Ensure we have an array even if the API returns null
                if (!categoriesData) {
                    console.warn('getCategories returned null or undefined');
                    return [];
                }

                // Add empty questions array to make TypeScript happy
                return categoriesData.map(category => ({
                    ...category,
                    questions: []
                })) as Category[];
            } catch (error) {
                console.error('Error fetching categories:', error);
                throw error; // Re-throw to let React Query handle the error state
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Hook for loading a specific category with questions
export function useCategoryWithQuestions(categoryId: number | null) {
    return useQuery({
        queryKey: ['category', categoryId],
        queryFn: async () => {
            try {
                if (categoryId === null) {
                    throw new Error('Category ID is null');
                }

                const categoryData = await getCategoryWithQuestions(categoryId);

                // Debug check
                console.log('Category with questions loaded:', categoryData);

                return categoryData;
            } catch (error) {
                console.error(`Error fetching category ${categoryId}:`, error);
                throw error;
            }
        },
        enabled: categoryId !== null,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}