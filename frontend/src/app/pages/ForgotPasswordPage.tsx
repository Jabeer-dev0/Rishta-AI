import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Heart, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { authApi } from '../services/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      if (res.success) {
        setSent(true);
        toast.success(res.message || 'Password reset link sent to your email');
      } else {
        toast.error(res.message || 'Failed to send reset link');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE5EC] via-white to-[#FFE5EC] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-[#D70040] rounded-full mb-4"
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </motion.div>
          <h1 className="text-3xl text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">
            {sent
              ? "We've sent you a reset link"
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:border-[#D70040] focus:ring-[#D70040]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#D70040] hover:bg-[#B00034] text-white py-6"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-gray-700 mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>
              <p className="text-sm text-gray-600">
                Please check your email and click the link to reset your password.
                If you don't see it, check your spam folder.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#D70040] hover:bg-[#B00034] text-white"
              >
                Return to Login
              </Button>
            </div>
          )}

          {!sent && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-[#D70040] hover:text-[#B00034] font-medium inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
