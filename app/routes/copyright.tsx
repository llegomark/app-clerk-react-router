// app/routes/copyright.tsx
import { ShieldIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';

export function meta() {
    return [
        { title: "Copyright Notice - NQESH Reviewer Pro" },
        { name: "description", content: "Copyright information and usage restrictions for NQESH Reviewer Pro content" },
    ];
}

export default function CopyrightNotice() {
    const currentYear = new Date().getFullYear();

    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary/10 p-3 rounded-full">
                    <ShieldIcon className="size-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Copyright Notice</h1>
                    <p className="text-sm text-muted-foreground">
                        Intellectual Property Protection and Usage Restrictions
                    </p>
                </div>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-lg">Ownership Statement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        All questions, answers, explanations, and other review materials presented on NQESH Reviewer Pro are the
                        exclusive intellectual property of Mark Anthony Llego and Eduventure Web Development Services. These materials
                        are protected by Philippine and international copyright laws and treaties.
                    </p>
                    <p>
                        © {currentYear} Mark Anthony Llego and Eduventure Web Development Services. All rights reserved.
                    </p>
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-lg">License vs. Ownership</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        By purchasing access to NQESH Reviewer Pro, users are <span className="font-semibold">not</span> purchasing
                        copyright ownership of any content or materials. Users are purchasing a limited, non-transferable license
                        to access and use the materials for personal educational purposes only.
                    </p>
                    <p>
                        This license:
                    </p>
                    <ul className="space-y-2 ml-6 list-disc">
                        <li>Does not transfer any intellectual property rights to the user</li>
                        <li>Is restricted to a single user account and cannot be shared</li>
                        <li>Permits personal use only for exam preparation purposes</li>
                        <li>May be revoked for violation of these terms</li>
                        <li>Expires according to the terms of your purchase or subscription</li>
                    </ul>
                    <p>
                        Upon termination of your access, either through subscription expiration or account termination,
                        you must cease all use of downloaded or saved materials and destroy any copies in your possession.
                    </p>
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-lg">Usage Restrictions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="font-medium">Users of this website are explicitly prohibited from:</p>

                    <ul className="space-y-2 ml-6 list-disc">
                        <li>Copying, reproducing, or duplicating any content from NQESH Reviewer Pro</li>
                        <li>Distributing, sharing, or transmitting content to unauthorized users</li>
                        <li>Creating derivative works based on our review materials</li>
                        <li>Selling, licensing, or commercially exploiting any content</li>
                        <li>Scraping, data mining, or automated collection of content</li>
                        <li>Removing any copyright notices or attributions</li>
                        <li>Publicly displaying or performing content without permission</li>
                        <li>Claiming ownership or authorship of the materials</li>
                        <li>Using the materials to create competing products or services</li>
                    </ul>

                    <p>
                        The content on NQESH Reviewer Pro is provided exclusively for personal, educational use by registered users.
                        Access to and use of the content does not transfer any ownership rights or imply any license to use the
                        content beyond personal study and preparation.
                    </p>
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-lg">Enforcement</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>
                        Unauthorized use of our intellectual property may result in legal action, including but not limited to
                        claims for copyright infringement, injunctive relief, and monetary damages. We actively monitor for
                        unauthorized use of our materials and will vigorously defend our intellectual property rights.
                    </p>
                    <p className="mt-4">
                        Violations may also result in immediate termination of access without refund, in addition to any legal remedies pursued.
                    </p>
                </CardContent>
            </Card>

            <div className="text-center space-y-2">
                <p className="text-sm">
                    For inquiries regarding licensing or permitted uses, please contact:
                </p>
                <p className="text-primary font-medium">support@nqesh.com</p>
                <Separator className="my-6" />
                <p className="text-xs text-muted-foreground">
                    This copyright notice was last updated on {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>
        </div>
    );
}