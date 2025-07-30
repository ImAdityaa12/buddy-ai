'use client';

import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Loader2Icon, OctagonAlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
const formSchema = z.object({
    email: z.email(),
    password: z.string().min(1, 'Password is required'),
});
const SignInView = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        setError(null);
        setPending(true);
        authClient.signIn.email(
            {
                email: data.email,
                password: data.password,
            },
            {
                onSuccess: () => {
                    setPending(false);
                    router.push('/');
                },
                onError: ({ error }) => {
                    setPending(false);
                    setError(error.message);
                },
            }
        );
    };
    const onSocial = (provider: 'github' | 'google') => {
        setError(null);
        setPending(true);

        authClient.signIn.social(
            {
                provider,
            },
            {
                onSuccess: () => {
                    setPending(false);
                    router.push('/');
                },
                onError: ({ error }) => {
                    setPending(false);
                    setError(error.message);
                },
            }
        );
    };
    return (
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <Form {...form}>
                        <form
                            className="p-6 md:p-8"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">
                                        Welcome back
                                    </h1>
                                    <p className="text-muted-foreground text-balance">
                                        Login to your account
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="a@example.com"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        {...field}
                                                        placeholder="********"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {!!error && (
                                    <Alert className="bg-destructive/10 border-none">
                                        <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                                        <AlertTitle>
                                            Incorrect email or password
                                        </AlertTitle>
                                    </Alert>
                                )}
                                <Button type="submit" disabled={pending}>
                                    {pending ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2Icon className="animate-spin" />
                                            Signing in
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                                        or continue with
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant={'outline'}
                                        type="button"
                                        className="w-full"
                                        onClick={() => {
                                            onSocial('google');
                                        }}
                                    >
                                        Google
                                    </Button>
                                    <Button
                                        variant={'outline'}
                                        type="button"
                                        className="w-full"
                                        onClick={() => {
                                            onSocial('github');
                                        }}
                                    >
                                        Github
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Don&apos;t have an account?{' '}
                                    <Link
                                        href="/sign-up"
                                        className="underline underline-offset-4"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                    {/* TODO: Add logo and text */}
                    <div className=" relative hidden md:flex flex-col gap-y-4 items-center justify-center">
                        <Image
                            src="/logo.svg"
                            alt="logo"
                            height={100}
                            width={100}
                        />
                        {/* <p className="text-2xl font-semibold">
                            buddy.ai
                        </p> */}
                    </div>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our{' '}
                <a href="#">Terms of service</a> and{' '}
                <a href="#">Privacy policy</a>
            </div>
        </div>
    );
};

export default SignInView;
