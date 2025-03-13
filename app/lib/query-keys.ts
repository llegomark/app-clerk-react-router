// app/lib/query-keys.ts
export const queryKeys = {
    categories: ['categories'] as const,
    categoryWithQuestions: (id: number) => ['category', id] as const,
    quizResults: {
        recent: (userId: string) => ['recentQuizResults', userId] as const,
        all: (userId: string) => ['quizResults', userId] as const,
    },
    dashboard: {
        categoryPerformance: (userId: string) => ['categoryPerformance', userId] as const,
        timeMetrics: (userId: string) => ['timeMetrics', userId] as const,
        detailedQuizAnswers: (userId: string) => ['detailedQuizAnswers', userId] as const,
    },
    flashCards: ['flashCards'] as const,
    depedOrders: (filters?: object) => ['depedOrders', filters] as const,
};