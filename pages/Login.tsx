import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { OTPInput } from '../components/OTPInput';
import { Mail, Lock, AlertCircle, Info, CheckCircle, Phone, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { ConfirmationResult } from 'firebase/auth';

type AuthMode = 'email' | 'phone';

export const Login: React.FC = () => {
    const { signInWithGoogle, loginWithEmail, resetPassword, sendPhoneOTP, verifyPhoneOTP, user } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<AuthMode>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const mapAuthError = (err: any) => {
        const code = err.code || err.message || '';
        if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
            return "Incorrect email or password. Please try again.";
        }
        if (code.includes('invalid-email')) return "Please enter a valid email address.";
        if (code.includes('user-disabled')) return "This account has been disabled. Contact support.";
        if (code.includes('too-many-requests')) return "Too many failed attempts. Try again later.";
        if (code.includes('invalid-phone')) return "Please enter a valid phone number with country code (e.g. +91...).";
        if (code.includes('invalid-verification-code')) return "Invalid OTP. Please try again.";
        if (code.includes('code-expired')) return "OTP has expired. Please request a new one.";
        return code || "An unexpected error occurred. Please try again.";
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setMessage(''); setLoading(true);
        try {
            await loginWithEmail(email, password);
            navigate('/');
        } catch (err: any) {
            setError(mapAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!phone || phone.length < 10) {
            setError('Please enter a valid phone number with country code.');
            return;
        }
        setError(''); setMessage(''); setLoading(true);
        try {
            const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
            const result = await sendPhoneOTP(formatted);
            setConfirmationResult(result);
            setOtpSent(true);
            setMessage('OTP sent to your phone number.');
        } catch (err: any) {
            setError(mapAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (otp: string) => {
        if (!confirmationResult) return;
        setError(''); setLoading(true);
        try {
            await verifyPhoneOTP(confirmationResult, otp);
            navigate('/');
        } catch (err: any) {
            setError(mapAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) { setError("Please enter your email address first."); return; }
        setError(''); setMessage(''); setLoading(true);
        try {
            await resetPassword(email);
            setMessage("Password reset link has been sent to your email.");
        } catch (err: any) {
            setError(mapAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(''); setMessage('');
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError("Google sign in failed. Please try email login.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-0 relative overflow-hidden bg-pudava-bg page-enter">
            <div className="absolute top-[-20%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-pudava-secondary/10 rounded-full filter blur-[100px] md:blur-[120px] animate-nebula-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-900/10 rounded-full filter blur-[100px] md:blur-[120px]"></div>

            {/* Invisible recaptcha container */}
            <div id="recaptcha-container"></div>

            <GlassCard className="w-full max-w-md p-6 md:p-10 border-t border-white/20 animate-slide-up">
                <div className="mb-6 md:mb-8 text-center">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold mb-1 md:mb-2 tracking-wide">Welcome Back</h1>
                    <p className="text-gray-400 text-xs md:text-sm">Sign in to access your account</p>
                </div>

                {/* Auth Mode Toggle */}
                <div className="flex mb-6 bg-white/5 rounded-xl p-1">
                    <button
                        onClick={() => { setMode('email'); setError(''); setMessage(''); setOtpSent(false); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                            mode === 'email' ? 'orchid-gradient text-white' : 'text-gray-400'
                        }`}
                    >
                        <Mail size={14} /> Email
                    </button>
                    <button
                        onClick={() => { setMode('phone'); setError(''); setMessage(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                            mode === 'phone' ? 'orchid-gradient text-white' : 'text-gray-400'
                        }`}
                    >
                        <Phone size={14} /> Phone
                    </button>
                </div>

                {error && (
                    <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-xl flex items-start gap-2 md:gap-3 text-xs md:text-sm glass-panel border-l-4 ${error.includes('verified') || error.includes('link') ? 'border-l-yellow-500 bg-yellow-500/10 text-yellow-200' : 'border-l-red-500 bg-red-500/10 text-red-200'}`}>
                        {error.includes('verified') ? <Info size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl flex items-start gap-2 md:gap-3 text-xs md:text-sm glass-panel border-l-4 border-l-green-500 bg-green-500/10 text-green-200">
                        <CheckCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {/* Email Login Form */}
                {mode === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-3 md:space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input type="email" placeholder="Email Address" value={email}
                                onChange={(e) => setEmail(e.target.value)} required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 md:py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password}
                                onChange={(e) => setPassword(e.target.value)} required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 md:py-3 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors w-8 h-8 flex items-center justify-center" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={handleForgotPassword}
                                className="text-xs text-pudava-secondary hover:text-white transition-colors">
                                Forgot Password?
                            </button>
                        </div>

                        <Button fullWidth type="submit" variant="gold" disabled={loading} className="h-11 md:h-12">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                )}

                {/* Phone Login Form */}
                {mode === 'phone' && !otpSent && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="tel"
                                placeholder="+91 Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 md:py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all"
                                inputMode="tel"
                            />
                        </div>
                        <Button fullWidth onClick={handleSendOTP} variant="gold" disabled={loading} className="h-11 md:h-12">
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </Button>
                    </div>
                )}

                {/* OTP Verification */}
                {mode === 'phone' && otpSent && (
                    <div className="space-y-5">
                        <div className="text-center">
                            <p className="text-sm text-gray-300">Enter the 6-digit code sent to</p>
                            <p className="text-sm text-white font-medium">{phone.startsWith('+') ? phone : `+91${phone}`}</p>
                        </div>

                        <OTPInput onComplete={handleVerifyOTP} disabled={loading} />

                        <div className="flex justify-center gap-4 text-xs">
                            <button onClick={() => setOtpSent(false)} className="text-gray-400 hover:text-white flex items-center gap-1">
                                <ArrowLeft size={12} /> Change Number
                            </button>
                            <button onClick={handleSendOTP} className="text-pudava-secondary hover:text-white">
                                Resend OTP
                            </button>
                        </div>
                    </div>
                )}

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#1a1a24] px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <Button fullWidth onClick={handleGoogleLogin} variant="secondary" className="flex gap-3 h-12">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                    Google
                </Button>

                <p className="text-sm text-center text-gray-400 mt-8">
                    Don't have an account? <Link to="/signup" className="text-pudava-secondary hover:text-white transition-colors font-medium">Sign Up</Link>
                </p>
            </GlassCard>
        </div>
    );
};