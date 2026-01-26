import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle, ArrowRight, Inbox } from 'lucide-react';

export const Signup: React.FC = () => {
  const { signupWithEmail } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mapAuthError = (err: any) => {
    const code = err.code || err.message;
    if (code.includes('email-already-in-use')) {
        return "This email is already registered. Try logging in instead.";
    }
    if (code.includes('invalid-email')) {
        return "Please enter a valid email address.";
    }
    if (code.includes('weak-password')) {
        return "Password is too weak. Please use at least 6 characters.";
    }
    if (code.includes('operation-not-allowed')) {
        return "Email/Password signup is currently disabled.";
    }
    return code || "Failed to create account. Please try again.";
  };

  const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
          await signupWithEmail(email, password, name);
          setIsSuccess(true);
      } catch (err: any) {
          setError(mapAuthError(err));
          setLoading(false);
      }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-pudava-bg">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-pudava-secondary/10 rounded-full filter blur-[120px] animate-pulse"></div>
        
        <GlassCard className="w-full max-w-md p-8 md:p-10 border-t border-white/20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-pudava-secondary/20 rounded-full flex items-center justify-center mb-6 border border-pudava-secondary/30">
                <Inbox size={40} className="text-pudava-secondary animate-bounce" />
            </div>
            
            <h1 className="text-3xl font-serif font-bold mb-4 tracking-wide">Verify Your Email</h1>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                We've sent a verification link to <span className="text-white font-bold">{email}</span>. 
                Please click the link in your email to activate your account.
            </p>

            <div className="w-full space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-gray-400 text-left flex gap-3">
                    <AlertCircle size={16} className="shrink-0 text-pudava-secondary" />
                    <span>Can't find it? Check your <b>Spam</b> or <b>Junk</b> folder. The link is valid for 1 hour.</span>
                </div>

                <Button 
                    fullWidth 
                    variant="gold" 
                    onClick={() => navigate('/login')}
                    className="h-12"
                >
                    Back to Login <ArrowRight size={18} />
                </Button>
            </div>
            
            <button 
                onClick={() => setIsSuccess(false)} 
                className="mt-8 text-xs text-gray-500 hover:text-white transition-colors"
            >
                Entered wrong email? Start over
            </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-pudava-bg">
       {/* Background decorative elements */}
       <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-pudava-secondary/10 rounded-full filter blur-[120px] animate-pulse"></div>
       
      <GlassCard className="w-full max-w-md p-8 md:p-10 border-t border-white/20">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-serif font-bold mb-2 tracking-wide">Create Account</h1>
            <p className="text-gray-400 text-sm">Join Pudava for exclusive access</p>
        </div>

        {error && (
            <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm glass-panel border-l-4 border-l-red-500 bg-red-500/10 text-red-200">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                />
            </div>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="email" 
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="password" 
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                />
            </div>
            <Button 
                fullWidth 
                type="submit"
                variant="gold"
                disabled={loading}
                className="h-12 mt-4"
            >
                {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
        </form>
        
        <p className="text-sm text-center text-gray-400 mt-8">
            Already have an account? <Link to="/login" className="text-pudava-secondary hover:text-white transition-colors font-medium">Log In</Link>
        </p>
      </GlassCard>
    </div>
  );
};