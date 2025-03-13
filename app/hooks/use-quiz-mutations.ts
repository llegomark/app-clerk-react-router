// app/hooks/use-quiz-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveQuizResult } from '~/lib/supabase';
import type { QuizResult } from '~/types';
import { logDebug, logError } from '~/lib/supabase';
import { queryKeys } from '~/lib/query-keys';

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

        // Add optimistic update
        onMutate: async ({ userId, resultData }) => {
            // Cancel any outgoing refetches to avoid overwriting our optimistic update
            await queryClient.cancelQueries({
                queryKey: queryKeys.quizResults.recent(userId)
            });

            // Snapshot the previous value
            const previousResults = queryClient.getQueryData(queryKeys.quizResults.recent(userId));

            // Optimistically update the results list
            if (previousResults) {
                queryClient.setQueryData(
                    queryKeys.quizResults.recent(userId),
                    (old: any) => {
                        // Check if old is available and has a results array
                        if (!old || !old.results) return { results: [resultData], totalCount: 1 };

                        // Create a new results array with the new quiz result
                        return {
                            ...old,
                            results: [
                                {
                                    id: Date.now(), // Temporary ID
                                    categoryId: resultData.categoryId,
                                    categoryName: "Category",  // This will be replaced on server
                                    score: resultData.score,
                                    totalQuestions: resultData.totalQuestions,
                                    completedAt: new Date().toISOString(),
                                },
                                ...old.results
                            ],
                            totalCount: (old.totalCount || 0) + 1
                        };
                    }
                );
            }

            // Return the previous results so we can revert if needed
            return { previousResults };
        },

        onSuccess: (data, variables) => {
            logDebug('Results saved successfully for user:', variables.userId);

            // Invalidate only the necessary queries
            queryClient.invalidateQueries({
                queryKey: queryKeys.quizResults.recent(variables.userId)
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.dashboard.categoryPerformance(variables.userId)
            });

            // Only invalidate specific user's metrics
            queryClient.invalidateQueries({
                queryKey: queryKeys.dashboard.timeMetrics(variables.userId)
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.dashboard.detailedQuizAnswers(variables.userId)
            });
        },

        onError: (error, variables, context) => {
            console.error(`Mutation error for user ${variables.userId}:`, error);
            logError('Failed to save results', error);

            // Rollback to the previous results on error
            if (context?.previousResults) {
                queryClient.setQueryData(
                    queryKeys.quizResults.recent(variables.userId),
                    context.previousResults
                );
            }
        },

        // Critical: Retry settings
        retry: 1,  // Only retry once to avoid database flooding
        retryDelay: 1000 // Wait 1 second before retrying
    });
}