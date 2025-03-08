// app/components/not-found-quiz.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpenIcon, MapPinIcon, CheckIcon, XIcon } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Progress } from '~/components/ui/progress';

// Quiz questions for the 404 page
const questions = [
    {
        id: 1,
        question: "What does a 404 error indicate?",
        options: [
            "The server is down for maintenance",
            "The page you're looking for doesn't exist",
            "Your internet connection is lost",
            "The website's domain has expired"
        ],
        correctAnswer: 1
    },
    {
        id: 2,
        question: "What's the best way to navigate a website?",
        options: [
            "By typing random URLs and hoping for the best",
            "Using navigation menus and links",
            "Asking the website politely where to go",
            "Sending a formal letter to the webmaster"
        ],
        correctAnswer: 1
    },
    {
        id: 3,
        question: "When lost on a website, what's the most reliable solution?",
        options: [
            "Refresh the page repeatedly until something changes",
            "Close your eyes and click randomly",
            "Return to the homepage and start over",
            "Blame your computer and restart it"
        ],
        correctAnswer: 2
    }
];

export function NotFoundQuiz() {
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    function handleAnswer(selectedOptionIndex: number) {
        // Save the answer
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = selectedOptionIndex;
        setUserAnswers(newAnswers);

        // Move to next question or finish
        if (isLastQuestion) {
            setIsFinished(true);
        } else {
            setTimeout(() => {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }, 500);
        }
    }

    // Calculate score when finished
    const score = userAnswers.reduce((total, answer, index) => {
        return total + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);

    const progressPercentage = isFinished
        ? 100
        : ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl text-center">
            <div className="mb-8 flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
                    <MapPinIcon className="size-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Oops! Page Not Found</h1>

                {!isFinished && (
                    <p className="text-muted-foreground max-w-md">
                        It seems you've wandered into uncharted territory! While we help you find your way back,
                        let's see if you can ace this quick navigation quiz.
                    </p>
                )}
            </div>

            {!isFinished ? (
                <div className="mb-8">
                    <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <span>{Math.round(progressPercentage)}% complete</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 mb-6" />

                    <Card className="mb-4 text-left">
                        <CardHeader className="pb-2 pt-4 px-6">
                            <h2 className="text-lg font-medium">
                                {currentQuestion.question}
                            </h2>
                        </CardHeader>
                        <CardContent className="px-6 pb-4">
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = userAnswers[currentQuestionIndex] === index;

                                    return (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left h-auto py-3 px-4",
                                                "transition-colors",
                                                isSelected && "border-primary/70 bg-primary/10 text-foreground"
                                            )}
                                            onClick={() => handleAnswer(index)}
                                            disabled={userAnswers[currentQuestionIndex] !== undefined}
                                        >
                                            {option}
                                        </Button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="mb-8">
                    <Card>
                        <CardHeader className="pb-2 pt-6">
                            <h2 className="text-xl font-bold">Quiz Results</h2>
                            <p className="text-muted-foreground">
                                You scored {score} out of {questions.length}
                            </p>
                        </CardHeader>
                        <CardContent className="px-6 py-4">
                            <div className="space-y-4">
                                {questions.map((question, qIndex) => {
                                    const userAnswer = userAnswers[qIndex];
                                    const isCorrect = userAnswer === question.correctAnswer;

                                    return (
                                        <div key={question.id} className="text-left border rounded-md p-3">
                                            <div className="flex items-start gap-2 mb-2">
                                                {isCorrect ? (
                                                    <CheckIcon className="size-5 text-success shrink-0 mt-0.5" />
                                                ) : (
                                                    <XIcon className="size-5 text-destructive shrink-0 mt-0.5" />
                                                )}
                                                <h3 className="font-medium">{question.question}</h3>
                                            </div>

                                            <div className="pl-7 text-sm">
                                                <p className={
                                                    isCorrect ? "text-success-foreground" : "text-destructive-foreground"
                                                }>
                                                    Your answer: {question.options[userAnswer]}
                                                </p>

                                                {!isCorrect && (
                                                    <p className="text-success-foreground mt-1">
                                                        Correct answer: {question.options[question.correctAnswer]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                        <CardFooter className="px-6 py-4 border-t flex justify-center">
                            <div className="space-y-4 text-center">
                                {score === questions.length ? (
                                    <p className="text-success-foreground font-medium">
                                        Perfect score! You're a navigation expert!
                                    </p>
                                ) : score >= Math.floor(questions.length / 2) ? (
                                    <p className="text-amber-500 font-medium">
                                        Not bad! You've got some navigation skills!
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground font-medium">
                                        Well, at least you found our 404 page!
                                    </p>
                                )}

                                <Button
                                    size="lg"
                                    onClick={() => navigate('/')}
                                    className="cursor-pointer gap-2"
                                >
                                    <BookOpenIcon className="size-4" />
                                    Return to Homepage
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {!isFinished && (
                <div>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="cursor-pointer"
                    >
                        Skip Quiz & Return Home
                    </Button>
                </div>
            )}
        </div>
    );
}