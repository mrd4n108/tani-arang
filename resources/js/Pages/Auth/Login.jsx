import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Sprout, Users, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const [isLoggingInDemo, setIsLoggingInDemo] = useState(null); // 'petani' | 'komunitas' | null

    const handleQuickLogin = (demoRole, email, password) => {
        setIsLoggingInDemo(demoRole);
        try {
            localStorage.removeItem('taniarang_user_role');
            localStorage.removeItem('taniarang_community_address');
        } catch (e) {}

        router.post(
            '/login',
            {
                email,
                password,
                remember: true,
            },
            {
                onFinish: () => {
                    setIsLoggingInDemo(null);
                    reset('password');
                },
            }
        );
    };

    const handleFillCredentials = (email, password) => {
        setData({
            email,
            password,
            remember: true,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        try {
            localStorage.removeItem('taniarang_user_role');
            localStorage.removeItem('taniarang_community_address');
        } catch (err) {}

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout maxWidth="max-w-xl">
            <Head title="Masuk ke TaniArang" />

            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
                    Masuk ke TaniArang
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                    Silakan masuk untuk melanjutkan pencatatan, pemindaian, dan panduan pirolisis biomassa.
                </p>
            </div>

            {status && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    {status}
                </div>
            )}

            {/* Akses Cepat Dewan Juri (1-Klik Login) */}
            <div className="mb-6 p-4 rounded-2xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-700">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                        Akses Cepat Dewan Juri (1-Klik)
                    </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 mb-3.5">
                    Klik salah satu tombol simulasi untuk langsung masuk tanpa perlu mengetik kredensial.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Tombol Petani Demo */}
                    <button
                        type="button"
                        onClick={() => handleQuickLogin('petani', 'petani@taniarang.id', 'password')}
                        disabled={isLoggingInDemo !== null || processing}
                        className="p-3.5 rounded-xl border border-emerald-600 bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-left transition shadow-sm min-h-[64px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-60 cursor-pointer"
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                                    <Sprout className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="font-bold text-xs sm:text-sm">Petani Demo</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/80" />
                        </div>
                        <span className="text-[11px] text-emerald-100 mt-1">
                            {isLoggingInDemo === 'petani' ? 'Sedang masuk...' : 'Pak Joko (Lamongan)'}
                        </span>
                    </button>

                    {/* Tombol Komunitas Demo */}
                    <button
                        type="button"
                        onClick={() => handleQuickLogin('komunitas', 'komunitas@taniarang.id', 'password')}
                        disabled={isLoggingInDemo !== null || processing}
                        className="p-3.5 rounded-xl border border-amber-600 bg-amber-600 hover:bg-amber-500 text-white dark:bg-amber-600 dark:hover:bg-amber-500 text-left transition shadow-sm min-h-[64px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60 cursor-pointer"
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                                    <Users className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="font-bold text-xs sm:text-sm">Komunitas Demo</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/80" />
                        </div>
                        <span className="text-[11px] text-amber-100 mt-1">
                            {isLoggingInDemo === 'komunitas' ? 'Sedang masuk...' : 'Sentra Poktan Makmur'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200 dark:border-carbon-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-carbon-850 px-2 text-stone-500 dark:text-stone-400 font-medium">
                        Atau masuk secara manual
                    </span>
                </div>
            </div>

            {/* Manual Login Form */}
            <form onSubmit={submit} className="space-y-4">
                {/* Email Field */}
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email *" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="contoh: petani@taniarang.id"
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Password Field */}
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi *" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Masukkan kata sandi"
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Remember Me Checkbox & Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                            Ingat saya di perangkat ini
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href="/forgot-password"
                            className="text-xs text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline transition min-h-[44px] inline-flex items-center"
                        >
                            Lupa sandi?
                        </Link>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Link
                        href="/register"
                        className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline transition min-h-[44px] inline-flex items-center"
                    >
                        Belum punya akun? Buat akun baru
                    </Link>

                    <PrimaryButton className="w-full sm:w-auto min-h-[44px]" disabled={processing || isLoggingInDemo !== null}>
                        Masuk Sekarang
                    </PrimaryButton>
                </div>
            </form>

            {/* Kartu Dokumentasi Kredensial Uji Coba Dewan Juri */}
            <div className="mt-6 pt-5 border-t border-stone-200 dark:border-carbon-700">
                <div className="flex items-center gap-2 mb-3">
                    <KeyRound className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Dokumentasi Akun Uji Coba Juri
                    </span>
                </div>

                <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
                    {/* Akun Petani */}
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                                Petani: Pak Joko (Lamongan)
                            </div>
                            <div className="font-mono text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                                email: <span className="text-stone-800 dark:text-stone-200">petani@taniarang.id</span> • sandi: <span className="text-stone-800 dark:text-stone-200">password</span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                                Fitur: Pindai limbah, panduan olah mandiri, setoran limbah ke sentra, riwayat.
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleFillCredentials('petani@taniarang.id', 'password')}
                            className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 text-left sm:text-right min-h-[44px] inline-flex items-center"
                        >
                            Salin ke Form
                        </button>
                    </div>

                    {/* Akun Komunitas */}
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
                                <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                                Komunitas: Sentra Poktan Makmur (Lamongan)
                            </div>
                            <div className="font-mono text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                                email: <span className="text-stone-800 dark:text-stone-200">komunitas@taniarang.id</span> • sandi: <span className="text-stone-800 dark:text-stone-200">password</span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                                Fitur: Penerimaan setoran petani, badge notifikasi, pembaruan status 4 tahap, foto verifikasi.
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleFillCredentials('komunitas@taniarang.id', 'password')}
                            className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline shrink-0 text-left sm:text-right min-h-[44px] inline-flex items-center"
                        >
                            Salin ke Form
                        </button>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
