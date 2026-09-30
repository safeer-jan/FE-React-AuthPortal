import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/schemas/auth';
import { api } from '@/api/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/primitives';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const resetPassword = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      api.post('/auth/reset-password', { token, password: values.password }),
    onSuccess: () => {
      toast.success('Password updated — sign in with your new password');
      navigate('/login');
    },
    onError: () => toast.error('That reset link is invalid or has expired'),
  });

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <p className="text-sm text-text-muted">This reset link is missing or invalid.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <Card className="w-full max-w-sm p-8">
        <h1 className="mb-6 text-lg font-semibold text-text">Choose a new password</h1>
        <form onSubmit={handleSubmit((v) => resetPassword.mutate(v))} className="flex flex-col gap-4" noValidate>
          <Input
            label="New password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" isLoading={resetPassword.isPending} className="w-full">
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
