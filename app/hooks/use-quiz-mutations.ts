// app/hooks/use-quiz-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveQuizResult } from '~/lib/supabase';
import type { QuizResult } from '~/types';
import { logDebug, logError } from '~/lib/supabase';

export function useSaveQuizResult() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, resultData }: { userId: string, resultData: QuizResult }) => {
            if (!userId) {
                throw new Error('User ID is required to save quiz results');
            }

            console.log('Saving quiz result for user:', userId);
            logDebug('Saving quiz result:', resultData);

            try {
                const result = await saveQuizResult(userId, resultData);
                return result;
            } catch (error) {
                console.error('Error in saveQuizResult function:', error);
                throw error;
            }
        },

        onSuccess: (data, variables) => {
            logDebug('Results saved successfully for user:', variables.userId);

            // Invalidate only the necessary queries
            queryClient.invalidateQueries({
                queryKey: ['recentQuizResults', variables.userId]
            });

            queryClient.invalidateQueries({
                queryKey: ['categoryPerformance', variables.userId, variables.resultData.categoryId]
            });

            // Only invalidate specific user's metrics
            queryClient.invalidateQueries({
                queryKey: ['timeMetrics', variables.userId]
            });

            queryClient.invalidateQueries({
                queryKey: ['detailedQuizAnswers', variables.userId]
            });
        },

        onError: (error, variables) => {
            console.error(`Mutation error for user ${variables.userId}:`, error);
            logError('Failed to save results', error);
        },

        // Critical: Retry settings
        retry: 1,  // Only retry once to avoid database flooding
        retryDelay: 1000 // Wait 1 second before retrying
    });
}