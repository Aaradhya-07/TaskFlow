import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToggleLeft as Google } from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, error, loading } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLocalError(null);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white py-8 px-6 shadow rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Sign in to your account
        </h2>

        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error || localError}
          </div>
        )}

        <div className="space-y-4">
          <Button
            variant="outline"
            fullWidth
            leftIcon={<Google size={18} />}
            onClick={handleGoogleSignIn}
            isLoading={loading}
          >
            Sign in with Google
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;