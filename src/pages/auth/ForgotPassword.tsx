import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/schemas/auth';
import { api } from '@/api/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/primitives';

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const requestReset = useMutation({
    mutationFn: (values: ForgotPasswordFormValues) => api.post('/auth/forgot-password', values),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <Card className="w-full max-w-sm p-8">
        <h1 className="mb-1 text-lg font-semibold text-text">Reset your password</h1>
        <p className="mb-6 text-sm text-text-muted">We'll email you a link to reset it.</p>

        {requestReset.isSuccess ? (
          <p className="rounded-md bg-accent/10 p-3 text-sm text-accent">
            If that email exists, a reset link is on its way. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit((v) => requestReset.mutate(v))} className="flex flex-col gap-4" noValidate>
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Button type="submit" isLoading={requestReset.isPending} className="w-full">
              Send reset link
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link to="/login" className="text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
