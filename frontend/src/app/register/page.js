'use client'

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    // Redirect if already signed in
    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session, router]);

    const handleGoogleSignup = () => {
        signIn('google', { callbackUrl: '/' });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (res.ok) {
                // Sign in after successful registration
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (result?.ok) {
                    router.push('/');
                } else {
                    setError('Registration successful, but login failed');
                }
            } else {
                const data = await res.json();
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            setError('An error occurred during registration');
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
             <Card className="w-[400px]">
               <CardHeader>
 <CardTitle>                        Create your account
</CardTitle>
                 <CardDescription>Sign up to get started</CardDescription>
                 </CardHeader>
                       <CardContent className="space-y-4">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                    
                        <div className='space-y-2'>
                            <Label
                                htmlFor="name">Name</Label>
                            <Input
                                name="name"
                                type="text"
                                required
                                placeholder="Full name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                                <Label
                                htmlFor="email">Email address</Label>
                            <Input
                                name="email"
                                type="email"
                                required
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label
                                htmlFor="password">Password</Label>
                            <Input
                                name="password"
                                type="password"
                                required
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label
                                htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                name="confirmPassword"
                                type="password"
                                required
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>

                    <div className="flex items-center justify-center">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </Button>
                    </div>
                                  <Separator className="w-full" />
                    <div className="flex items-center justify-center">
                        <Button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign up with Google
                        </Button>
                    </div>

                    <div className="text-center">
                        <span className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="font-medium text-hover:text-indigo-500"
                            >
                                Sign in
                            </Button>
                        </span>
                    </div>
                </form>
                </CardContent>
             </Card>
        </div>
    );
}