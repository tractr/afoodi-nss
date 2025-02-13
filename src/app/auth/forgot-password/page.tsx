'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';
import LayoutSidebar from '@/components/layouts/layout-sidebar';
import Image from 'next/image';
import Link from 'next/link';
import supabaseClient from '@/lib/supabase-client';

type ForgotPasswordFormInputs = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormInputs>();

  const onSubmit = async (input: ForgotPasswordFormInputs) => {
    setIsLoading(true);
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(input.email, {
        redirectTo: new URL('/change-password', window.location.origin).toString(),
      });

      if (error) throw error;

      setIsSuccess(true);
      reset();
    } catch (error) {
      console.error(error);
      setError('root.serverError', {
        message: error instanceof Error ? error.message : 'Failed to send reset email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutSidebar
      containerClassName="bg-muted/50"
      contentClassName="flex w-full h-full items-center justify-center"
    >
      <Card className="max-w-md w-full">
        <CardHeader className="flex justify-center items-center gap-4">
          <Image src="/images/Logo_1.svg" alt="logo" width={150} height={100} />
          <CardTitle className="text-center text-lg font-extrabold">Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-6">
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <AlertDescription className="text-green-700 ml-2">
                  If an account exists with that email, we&apos;ve sent password reset instructions
                  to your email address.
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              {errors.root?.serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.root.serverError.message}</AlertDescription>
                </Alert>
              )}

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </LayoutSidebar>
  );
}
