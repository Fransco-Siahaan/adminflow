import { useState, useEffect, useRef, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../lib/axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

type Role = 'manager' | 'staff';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const toast = useToast();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<Role>('staff');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(cardRef.current, {
                y: 24,
                opacity: 0,
                duration: 0.6,
                ease: 'power3.out',
            });
        });

        return () => ctx.revert();
    }, []);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Nama wajib diisi';
        else if (name.trim().length < 2) newErrors.name = 'Nama minimal 2 karakter';

        if (!email.trim()) newErrors.email = 'Email wajib diisi';
        else if (!/^\S+@\S+\.\S+$/.test(email))
            newErrors.email = 'Format email tidak valid';

        if (!password) newErrors.password = 'Password wajib diisi';
        else if (password.length < 8)
            newErrors.password = 'Password minimal 8 karakter';

        if (password !== confirmPassword)
            newErrors.confirmPassword = 'Konfirmasi password tidak cocok';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            await register({ name, email, password, role });
            toast.success('Registrasi berhasil! Selamat datang 🎉');
            navigate('/dashboard', { replace: true });
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-primary-50/30 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
                            <span className="text-white font-bold">AF</span>
                        </div>
                        <span className="text-2xl font-bold text-surface-900">AdminFlow</span>
                    </Link>
                </div>

                <div ref={cardRef} className="card p-6 md:p-8">
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold text-surface-900">
                            Buat akun baru
                        </h1>
                        <p className="text-sm text-surface-500 mt-1">
                            Sudah punya akun?{' '}
                            <Link
                                to="/login"
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Masuk di sini
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nama Lengkap"
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={errors.name}
                            autoComplete="name"
                            autoFocus
                        />

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="nama@perusahaan.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="Minimal 8 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            hint="Minimal 8 karakter"
                            autoComplete="new-password"
                        />

                        <Input
                            label="Konfirmasi Password"
                            type="password"
                            name="confirmPassword"
                            placeholder="Ulangi password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={errors.confirmPassword}
                            autoComplete="new-password"
                        />

                        {/* Role selection */}
                        <div>
                            <label className="label">Daftar sebagai</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('staff')}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${role === 'staff'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-surface-200 hover:border-surface-300'
                                        }`}
                                >
                                    <div className="text-xl mb-1">🧑‍💼</div>
                                    <div className="text-sm font-medium text-surface-900">Staff</div>
                                    <div className="text-xs text-surface-500">Pelaksana task</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('manager')}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${role === 'manager'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-surface-200 hover:border-surface-300'
                                        }`}
                                >
                                    <div className="text-xl mb-1">👔</div>
                                    <div className="text-sm font-medium text-surface-900">Manager</div>
                                    <div className="text-xs text-surface-500">Pemberi task</div>
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            className="w-full mt-2"
                        >
                            {isLoading ? 'Memproses...' : 'Daftar'}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-surface-400 mt-6">
                    © {new Date().getFullYear()} AdminFlow. All rights reserved.
                </p>
            </div>
        </div>
    );
}