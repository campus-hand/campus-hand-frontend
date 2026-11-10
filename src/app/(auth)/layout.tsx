import { AuthLayout } from '@/features/auth/components/auth-layout';

export default function AuthGroupLayout({ children }: LayoutProps<'/'>) {
  return <AuthLayout>{children}</AuthLayout>;
}
