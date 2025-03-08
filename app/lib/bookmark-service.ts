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
            const bookmarkData = {
                question_id: question.id,
                category_id: categoryId,
                category_name: categoryName,
                question_text: question.question
                // Remove question_data temporarily to test if that's causing the issue
            };

            console.log('Inserting bookmark with data:', bookmarkData);

            // Try to insert the bookmark
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