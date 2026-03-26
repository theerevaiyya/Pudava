import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle, ArrowRight, Inbox, Eye, EyeOff } from 'lucide-react';

export const Signup: React.FC = () => {
  const { signupWithEmail } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (!pw) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' };
    if (score === 2) return { label: 'Fair', color: 'bg-orange-500', width: '40%' };
    if (score === 3) return { label: 'Good', color: 'bg-yellow-500', width: '60%' };
    if (score === 4) return { label: 'Strong', color: 'bg-green-500', width: '80%' };
    return { label: 'Very Strong', color: 'bg-emerald-400', width: '100%' };
  };

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
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-pudava-secondary/10 rounded-full filter blur-[120px] animate-pulse"></div>
        
        <GlassCard className="w-full max-w-md p-5 md:p-8 border-t border-white/20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-pudava-secondary/20 rounded-full flex items-center justify-center mb-4 border border-pudava-secondary/30">
                <Inbox size={32} className="text-pudava-secondary animate-bounce" />
            </div>
            
            <h1 className="text-2xl font-serif font-bold mb-3 tracking-wide">Verify Your Email</h1>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
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
                className="mt-5 text-xs text-gray-500 hover:text-white transition-colors"
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
       <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-pudava-secondary/10 rounded-full filter blur-[120px] animate-pulse"></div>
       
      <GlassCard className="w-full max-w-md p-5 md:p-8 border-t border-white/20">
        <div className="mb-5 text-center">
            <h1 className="text-3xl font-serif font-bold mb-2 tracking-wide">Create Account</h1>
            <p className="text-gray-400 text-sm">Join Pudava for exclusive access</p>
        </div>

        {error && (
            <div className="mb-4 p-3 rounded-xl flex items-start gap-3 text-sm glass-panel border-l-4 border-l-red-500 bg-red-500/10 text-red-200">
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors w-8 h-8 flex items-center justify-center" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {password && (
                <div className="space-y-1">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(password).color}`} style={{ width: getPasswordStrength(password).width }} />
                    </div>
                    <p className={`text-xs ${getPasswordStrength(password).color.replace('bg-', 'text-')}`}>{getPasswordStrength(password).label}</p>
                </div>
            )}
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