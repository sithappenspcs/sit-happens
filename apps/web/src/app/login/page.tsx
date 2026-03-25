import { Suspense } from 'react';
import LoginForm from './LoginForm';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
