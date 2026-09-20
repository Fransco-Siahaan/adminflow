import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../lib/axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const toast = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);

    // GSAP entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.from(logoRef.current, {
                y: -20,
                opacity: 0,
                duration: 0.6,
            }).from(
                cardRef.current,
                {
                    y: 24,
                    opacity: 0,
                    duration: 0.6,
                },
                '-=0.3'
            );
        });

        return () => ctx.revert();  // cleanup saat unmount
    }, []);

    const validate = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!password) {
            newErrors.password = 'Password wajib diisi';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            await login(email, password);
            toast.success('Login berhasil! Selamat datang 👋');

            // Redirect: ke halaman yang diminta, atau dashboard
            const from = (location.state as { from?: { pathname: string } })?.from
                ?.pathname;
            navigate(from || '/dashboard', { replace: true });
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const fillDemo = (role: 'manager' | 'staff') => {
        if (role === 'manager') {
            setEmail('manager@adminflow.test');
            setPassword('password123');
        } else {
            setEmail('staff@adminflow.test');
            setPassword('password123');
        }
        setErrors({});
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-primary-50/30 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div ref={logoRef} className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
                            <span className="text-white font-bold">AF</span>
                        </div>
                        <span className="text-2xl font-bold text-surface-900">AdminFlow</span>
                    </div>
                    <p className="text-sm text-surface-500">
                        Simple Administrative Workflow Management
                    </p>
                </div>

                {/* Card */}
                <div ref={cardRef} className="card p-6 md:p-8">
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold text-surface-900">Masuk ke akun</h1>
                        <p className="text-sm text-surface-500 mt-1">
                            Belum punya akun?{' '}
                            <Link
                                to="/register"
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="nama@perusahaan.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            autoComplete="email"
                            autoFocus
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            autoComplete="current-password"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Memproses...' : 'Masuk'}
                        </Button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 pt-6 border-t border-surface-200">
                        <p className="text-xs text-surface-500 mb-2 text-center">
                            Demo akun (klik untuk isi otomatis)
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => fillDemo('manager')}
                                className="flex-1 px-3 py-2 text-xs font-medium text-surface-600 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
                            >
                                👔 Manager
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemo('staff')}
                                className="flex-1 px-3 py-2 text-xs font-medium text-surface-600 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
                            >
                                🧑‍💼 Staff
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-surface-400 mt-6">
                    © {new Date().getFullYear()} AdminFlow. All rights reserved.
                </p>
            </div>
        </div>
    );
}