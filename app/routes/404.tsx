// app/routes/404.tsx
import { NotFoundQuiz } from '~/components/not-found-quiz';

export function meta() {
    return [
        { title: "404 - Page Not Found - NQESH Reviewer Pro" },
        { name: "description", content: "This page doesn't exist, but try our navigation quiz!" },
    ];
}

export default function NotFound() {
    return <NotFoundQuiz />;
}