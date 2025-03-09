// app/lib/bookmark-service.ts
import { useSupabase } from './supabase-clerk';
import type { Question } from '~/types';
import { toast } from 'sonner';

// Convert the service into a custom hook (name must start with "use")
export function useBookmarkService() {
    const supabase = useSupabase();

    /**
     * Adds a question to the user's bookmarks
     * With detailed error logging
     */
    const addBookmark = async (
        question: Question,
        categoryId: number,
        categoryName: string
    ) => {
        console.log('Adding bookmark for question:', question.id);
        console.log('Category ID:', categoryId);
        console.log('Category Name:', categoryName);

        try {
            // Check if question is already bookmarked to avoid duplicates
            const { data: existingBookmark, error: checkError } = await supabase
                .from('bookmarked_questions')
                .select('id')
                .eq('question_id', question.id)
                .maybeSingle();

            if (checkError) {
                console.error('Error checking for existing bookmark:', checkError);
            }

            if (existingBookmark) {
                console.log('Question already bookmarked:', existingBookmark);
                toast.info('Question is already bookmarked');
                return { success: true, alreadyExists: true };
            }

            // Prepare the bookmark data
            let questionDataStr;
            try {
                // Safely serialize the question data
                questionDataStr = JSON.stringify({
                    options: question.options || [],
                    correctAnswer: question.correctAnswer || 0,
                    explanation: question.explanation || '',
                    reference: question.reference || null
                });
                console.log('Serialized question data:', questionDataStr);
            } catch (serializeError) {
                console.error('Error serializing question data:', serializeError);
                // Provide fallback data if serialization fails
                questionDataStr = JSON.stringify({
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctAnswer: 0,
                    explanation: 'No explanation available'
                });
            }

            const bookmarkData = {
                question_id: question.id,
                category_id: categoryId,
                category_name: categoryName,
                question_text: question.question,
                question_data: questionDataStr,
                // Explicitly set the timestamp if it's a required field
                bookmarked_at: new Date().toISOString()
            };

            console.log('Inserting bookmark with data:', bookmarkData);

            // Try to insert the bookmark
            console.log('Sending to Supabase with data structure:', {
                table: 'bookmarked_questions',
                fields: Object.keys(bookmarkData),
                questionIdType: typeof bookmarkData.question_id
            });

            const { data, error } = await supabase
                .from('bookmarked_questions')
                .insert(bookmarkData)
                .select('id')
                .single();

            if (error) {
                console.error('Supabase error adding bookmark:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                console.error('Error details:', error.details);

                // If the error is because the question is already bookmarked, just return
                if (error.code === '23505') {
                    toast.info('Question is already bookmarked');
                    return { success: true, alreadyExists: true };
                }

                // Handle specific error cases
                if (error.code === '42P01') {
                    console.error('Table not found. Check your Supabase setup');
                    toast.error('Database configuration issue. Please contact support.');
                    return { success: false, error };
                }

                if (error.code?.startsWith('PGRST')) {
                    console.error('PostgREST error. Likely a permissions issue:', error.message);
                    toast.error('Permission denied. Please sign in again.');
                    return { success: false, error };
                }

                // Try a simplified version as fallback if we suspect data issues
                if (error.code === '23502' || error.message?.includes('null value')) {
                    console.log('Attempting fallback with minimal data...');
                    try {
                        // Try with minimal required fields
                        const fallbackData = {
                            question_id: question.id,
                            category_id: categoryId || 0,
                            category_name: categoryName || 'Unknown',
                            question_text: question.question || 'Unknown question',
                            bookmarked_at: new Date().toISOString()
                        };

                        const { data: fallbackResult, error: fallbackError } = await supabase
                            .from('bookmarked_questions')
                            .insert(fallbackData)
                            .select('id')
                            .single();

                        if (!fallbackError) {
                            console.log('Fallback bookmark added successfully:', fallbackResult);
                            toast.success('Bookmark added (limited data)');
                            return { success: true, data: fallbackResult, limited: true };
                        } else {
                            console.error('Fallback also failed:', fallbackError);
                        }
                    } catch (fallbackErr) {
                        console.error('Error in fallback attempt:', fallbackErr);
                    }
                }

                throw error;
            }

            console.log('Bookmark added successfully:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Error adding bookmark:', error);
            return { success: false, error };
        }
    };

    /**
     * Removes a question from the user's bookmarks
     */
    const removeBookmark = async (questionId: number) => {
        console.log('Removing bookmark for question:', questionId);

        try {
            const { data, error } = await supabase
                .from('bookmarked_questions')
                .delete()
                .eq('question_id', questionId)
                .select('id')
                .maybeSingle();

            if (error) {
                console.error('Error removing bookmark:', error);
                throw error;
            }

            console.log('Bookmark removed successfully:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Error removing bookmark:', error);
            return { success: false, error };
        }
    };

    /**
     * Checks if a question is bookmarked by the user
     */
    const isQuestionBookmarked = async (questionId: number) => {
        try {
            const { data, error } = await supabase
                .from('bookmarked_questions')
                .select('id')
                .eq('question_id', questionId)
                .maybeSingle();

            if (error) {
                console.error('Error checking bookmark status:', error);
                return { isBookmarked: false, error };
            }

            return { isBookmarked: !!data, bookmarkId: data?.id };
        } catch (error) {
            console.error('Error checking bookmark status:', error);
            return { isBookmarked: false, error };
        }
    };

    /**
     * Gets all bookmarked questions for the current user
     */
    const getBookmarkedQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from('bookmarked_questions')
                .select('*')
                .order('bookmarked_at', { ascending: false });

            if (error) {
                console.error('Error fetching bookmarks:', error);
                throw error;
            }

            console.log('Fetched bookmarks:', data?.length || 0);
            return { bookmarks: data || [] };
        } catch (error) {
            console.error('Error fetching bookmarked questions:', error);
            return { bookmarks: [], error };
        }
    };

    /**
     * Gets the count of bookmarked questions for the current user
     */
    const getBookmarkedQuestionsCount = async () => {
        try {
            const { count, error } = await supabase
                .from('bookmarked_questions')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;

            return { count: count || 0 };
        } catch (error) {
            console.error('Error counting bookmarked questions:', error);
            return { count: 0, error };
        }
    };

    return {
        addBookmark,
        removeBookmark,
        isQuestionBookmarked,
        getBookmarkedQuestions,
        getBookmarkedQuestionsCount
    };
}