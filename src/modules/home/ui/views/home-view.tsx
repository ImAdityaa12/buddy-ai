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
    TrendingUpIcon,
    ShieldCheckIcon,
    ClockIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomeView() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-primary/20"></div>
                </div>
            </div>
        );
    }

    const features = [
        {
            icon: BotIcon,
            title: 'AI Agents',
            description:
                'Create and manage intelligent AI agents tailored to your specific needs and workflows',
            href: '/agents',
            color: 'from-blue-500/20 to-cyan-500/20',
            iconColor: 'text-blue-600',
        },
        {
            icon: VideoIcon,
            title: 'Smart Meetings',
            description:
                'Schedule and conduct AI-powered meetings with seamless integration and insights',
            href: '/meetings',
            color: 'from-purple-500/20 to-pink-500/20',
            iconColor: 'text-purple-600',
        },
        {
            icon: TrendingUpIcon,
            title: 'Analytics',
            description:
                'Get comprehensive insights and performance metrics from your AI interactions',
            color: 'from-green-500/20 to-emerald-500/20',
            iconColor: 'text-green-600',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Secure & Private',
            description:
                'Enterprise-grade security with end-to-end encryption for all your data',
            color: 'from-orange-500/20 to-red-500/20',
            iconColor: 'text-orange-600',
        },
    ];

    const stats = [
        {
            label: 'AI Agents Created',
            value: '2.5K+',
            icon: BotIcon,
            change: '+12%',
        },
        {
            label: 'Active Users',
            value: '10K+',
            icon: UsersIcon,
            change: '+25%',
        },
        {
            label: 'Meetings Completed',
            value: '50K+',
            icon: VideoIcon,
            change: '+18%',
        },
        {
            label: 'Hours Saved',
            value: '100K+',
            icon: ClockIcon,
            change: '+30%',
        },
    ];

    const quickActions = [
        {
            title: 'Create Your First Agent',
            description: 'Build a custom AI agent in minutes',
            icon: BotIcon,
            href: '/agents',
            variant: 'primary' as const,
        },
        {
            title: 'Schedule a Meeting',
            description: 'Start collaborating with AI assistance',
            icon: VideoIcon,
            href: '/meetings',
            variant: 'secondary' as const,
        },
        {
            title: 'Explore Templates',
            description: 'Browse pre-built agent templates',
            icon: SparklesIcon,
            href: '/templates',
            variant: 'outline' as const,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* Hero Section */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div
                        className={`text-center space-y-8 transition-all duration-1000 ${
                            mounted
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-10'
                        }`}
                    >
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm text-primary px-6 py-3 rounded-full text-sm font-medium border border-primary/20 shadow-lg">
                                <SparklesIcon className="h-4 w-4 animate-pulse" />
                                Welcome back, {session?.user.name}!
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                                Your AI-Powered
                                <br />
                                <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                                    Creative Workspace
                                </span>
                            </h1>

                            <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                                Transform your productivity with cutting-edge AI
                                technology.
                                <br className="hidden sm:block" />
                                Create, collaborate, and innovate like never
                                before.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button
                                asChild
                                size="lg"
                                className="h-14 px-10 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            >
                                <Link href="/agents">
                                    <BotIcon className="mr-3 h-6 w-6" />
                                    Explore Agents
                                    <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-14 px-10 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300 transform hover:scale-105"
                            >
                                <Link href="/meetings">
                                    <VideoIcon className="mr-3 h-6 w-6" />
                                    Start Meeting
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <Card
                            key={index}
                            className={`group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${
                                mounted
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-10'
                            }`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <CardContent className="pt-8 pb-6 relative">
                                <div className="flex justify-center mb-6">
                                    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                                        <stat.icon className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        {stat.value}
                                    </div>
                                    <div className="text-muted-foreground font-medium">
                                        {stat.label}
                                    </div>
                                    <div className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <TrendingUpIcon className="h-3 w-3" />
                                        {stat.change}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Enhanced Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div
                    className={`text-center mb-16 transition-all duration-1000 ${
                        mounted
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: '200ms' }}
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                        Powerful{' '}
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            Features
                        </span>
                    </h2>
                    <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
                        Discover the revolutionary tools that make Buddy AI your
                        ultimate digital companion
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className={`group relative overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                                mounted
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-10'
                            }`}
                            style={{
                                transitionDelay: `${300 + index * 100}ms`,
                            }}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                            />
                            <CardHeader className="text-center relative pb-4">
                                <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <feature.icon
                                        className={`h-8 w-8 ${feature.iconColor}`}
                                    />
                                </div>
                                <CardTitle className="text-xl font-bold">
                                    {feature.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <CardDescription className="text-center leading-relaxed text-base mb-6">
                                    {feature.description}
                                </CardDescription>
                                {feature.href && (
                                    <div className="text-center">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="group-hover:bg-primary/10 transition-all duration-300 font-semibold"
                                        >
                                            <Link href={feature.href}>
                                                Explore
                                                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-sm shadow-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                    <CardContent className="p-12 relative">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                                Ready to Transform Your Workflow?
                            </h3>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Join thousands of users who are already
                                experiencing the future of productivity
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {quickActions.map((action, index) => (
                                <Card
                                    key={index}
                                    className="group border-0 bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    <CardContent className="p-6 text-center">
                                        <div className="mb-4">
                                            <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit group-hover:bg-primary/20 transition-colors duration-300">
                                                <action.icon className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                        <h4 className="font-semibold mb-2">
                                            {action.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {action.description}
                                        </p>
                                        <Button
                                            asChild
                                            variant={'default'}
                                            size="sm"
                                            className="w-full"
                                        >
                                            <Link href={action.href}>
                                                Get Started
                                                <ArrowRightIcon className="ml-2 h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced Footer */}
            <div className="border-t bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <div className="text-sm text-muted-foreground">
                                    Logged in as{' '}
                                    <span className="font-semibold text-foreground">
                                        {session?.user.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
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
        </div>
    );
}
