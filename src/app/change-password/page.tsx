'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';
import LayoutSidebar from '@/components/layout-sidebar';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import supabaseClient from '@/lib/supabase-client';

type ChangePasswordFormInputs = {
  password: string;
  confirmPassword: string;
};

export default function ChangePasswordPage() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
  } = useForm<ChangePasswordFormInputs>();

  const password = watch('password');

  const onSubmit = async (input: ChangePasswordFormInputs) => {
    setIsLoading(true);
    setIsSuccess(false);
    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: input.password,
      });

      if (error) throw error;

      queryClient.invalidateQueries();
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      setError('root.serverError', {
        message: error instanceof Error ? error.message : 'Failed to update password',
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
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center justify-center gap-4">
          <Image src="/images/logo.svg" alt="logo" width={150} height={100} />
          <CardTitle className="text-center text-lg font-extrabold">
            {isSuccess ? 'Password Updated' : 'Change Your Password'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-6">
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <AlertDescription className="ml-2 text-green-700">
                  Your password has been successfully updated! You can now use your new password to
                  log in.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2">
                <Link href="/" className="w-full">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
                <Button className="w-full" variant="outline" onClick={() => setIsSuccess(false)}>
                  Change Password Again
                </Button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'The passwords do not match',
                    })}
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>

              {errors.root?.serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.root.serverError.message}</AlertDescription>
                </Alert>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </LayoutSidebar>
  );
}
