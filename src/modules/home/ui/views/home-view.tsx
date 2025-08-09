'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
    BotIcon,
    VideoIcon,
    ArrowRightIcon,
    SparklesIcon,
    UsersIcon,
    ZapIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function HomeView() {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const features = [
        {
            icon: BotIcon,
            title: 'AI Agents',
            description:
                'Create and manage intelligent AI agents tailored to your needs',
            href: '/agents',
        },
        {
            icon: VideoIcon,
            title: 'Meetings',
            description:
                'Schedule and conduct AI-powered meetings with your agents',
            href: '/meetings',
        },
        {
            icon: SparklesIcon,
            title: 'Smart Insights',
            description:
                'Get intelligent insights and recommendations from your AI companions',
        },
        {
            icon: ZapIcon,
            title: 'Lightning Fast',
            description:
                'Experience blazing fast responses and real-time interactions',
        },
    ];

    const stats = [
        { label: 'AI Agents', value: '50+', icon: BotIcon },
        { label: 'Active Users', value: '1K+', icon: UsersIcon },
        { label: 'Meetings', value: '10K+', icon: VideoIcon },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                                <SparklesIcon className="h-4 w-4" />
                                Welcome back, {session?.user.name}!
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                                Your AI-Powered
                                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    {' '}
                                    Workspace
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                Harness the power of artificial intelligence to
                                streamline your workflow, enhance productivity,
                                and unlock new possibilities with Buddy AI.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="h-12 px-8">
                                <Link href="/agents">
                                    <BotIcon className="mr-2 h-5 w-5" />
                                    Explore Agents
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-12 px-8"
                            >
                                <Link href="/meetings">
                                    <VideoIcon className="mr-2 h-5 w-5" />
                                    Start Meeting
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <Card
                            key={index}
                            className="text-center border-0 bg-gradient-to-br from-card to-card/50 shadow-lg"
                        >
                            <CardContent className="pt-6">
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <stat.icon className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-muted-foreground">
                                    {stat.label}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        Powerful Features
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Discover the tools and capabilities that make Buddy AI
                        your perfect digital companion
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50"
                        >
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-lg">
                                    {feature.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center leading-relaxed">
                                    {feature.description}
                                </CardDescription>
                                {feature.href && (
                                    <div className="mt-4 text-center">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="group-hover:bg-primary/10"
                                        >
                                            <Link href={feature.href}>
                                                Explore
                                                <ArrowRightIcon className="ml-1 h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Card className="border-0 bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-bold mb-2">
                                    Ready to get started?
                                </h3>
                                <p className="text-muted-foreground">
                                    Create your first AI agent or schedule a
                                    meeting to experience the power of Buddy AI
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button asChild>
                                    <Link href="/agents">
                                        <BotIcon className="mr-2 h-4 w-4" />
                                        Create Agent
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/meetings">
                                        <VideoIcon className="mr-2 h-4 w-4" />
                                        New Meeting
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="border-t bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                                Logged in as{' '}
                                <span className="font-medium">
                                    {session?.user.name}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                authClient.signOut({
                                    fetchOptions: {
                                        onSuccess: () => {
                                            router.push('/sign-in');
                                        },
                                    },
                                })
                            }
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
