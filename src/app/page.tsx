'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client'; //import the auth client

export default function Home() {
    const { data: session } = authClient.useSession();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const onSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        authClient.signUp.email(
            {
                email,
                name,
                password,
            },
            {
                onSuccess: (ctx) => {
                    console.log(ctx);
                },
                onError: (ctx) => {
                    alert(ctx.error.message);
                },
            }
        );
    };
    const onSubmitLogin = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        authClient.signIn.email(
            {
                email,
                password,
            },
            {
                onSuccess: (ctx) => {
                    console.log(ctx);
                },
                onError: (ctx) => {
                    alert(ctx.error.message);
                },
            }
        );
    };
    if (session) {
        return (
            <div>
                <p>Welcome, {session.user.name}!</p>
                <Button onClick={() => authClient.signOut()}>Sign Out</Button>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-y-10">
            <div className="flex flex-col items-center justify-center gap-4">
                <Input
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" onClick={onSubmit}>
                    Register
                </Button>
            </div>
            <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Input
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={onSubmitLogin}>
                Login
            </Button>
        </div>
    );
}
