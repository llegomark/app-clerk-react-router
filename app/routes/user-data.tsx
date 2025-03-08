// app/routes/user-data.tsx
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/react-router';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { toast } from 'sonner';
import { ProtectedRoute } from '~/components/protected-route';
import { useSupabase } from '~/lib/supabase-clerk';
import type { Database } from '~/lib/supabase-types';

export function meta() {
    return [
        { title: "User Data - NQESH Reviewer Pro" },
        { name: "description", content: "Manage your personal data" },
    ];
}

export default function UserDataPage() {
    return (
        <ProtectedRoute>
            <UserDataContent />
        </ProtectedRoute>
    );
}

type UserData = Database['public']['Tables']['user_data']['Row'];

function UserDataContent() {
    const { user } = useUser();
    const supabase = useSupabase();
    const [userDataList, setUserDataList] = useState<UserData[]>([]);
    const [newContent, setNewContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to load user data
    const loadUserData = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log("Fetching user data...");
            const { data, error } = await supabase
                .from('user_data')
                .select('*')
                .order('id', { ascending: false });

            if (error) {
                console.error("Supabase error:", error);
                throw error;
            }

            console.log("Data fetched successfully:", data);
            setUserDataList(data || []);
        } catch (err: any) {
            console.error('Error loading user data:', err);
            setError(err.message || 'Failed to load your data');
            toast.error('Failed to load your data');
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on mount and when user changes
    useEffect(() => {
        if (user) {
            loadUserData();
        }
    }, [user]);

    // Handle form submission
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!newContent.trim()) {
            toast.error('Please enter some content');
            return;
        }

        try {
            console.log("Inserting new content:", newContent);

            const { error } = await supabase
                .from('user_data')
                .insert({
                    content: newContent.trim()
                });

            if (error) {
                console.error("Insert error:", error);
                throw error;
            }

            toast.success('Content added successfully');
            setNewContent('');

            // Reload the data
            loadUserData();

        } catch (err: any) {
            console.error('Error adding user data:', err);
            toast.error(err.message || 'Failed to add your content');
        }
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Your Personal Data</h1>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Add New Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            type="text"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="Enter your content..."
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading}>Add</Button>
                    </form>
                </CardContent>
            </Card>

            <h2 className="text-xl font-semibold mb-4">Your Content</h2>

            {error && (
                <Card className="mb-4 bg-destructive/10">
                    <CardContent className="p-4">
                        <p className="text-destructive">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadUserData}
                            className="mt-2"
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="text-center py-8">
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading your data...</p>
                </div>
            ) : userDataList.length === 0 && !error ? (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        You haven't added any content yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {userDataList.map((data) => (
                        <Card key={data.id}>
                            <CardContent className="p-4">
                                <p>{data.content}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    ID: {data.id} • User: {data.user_id.slice(0, 8)}...
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}