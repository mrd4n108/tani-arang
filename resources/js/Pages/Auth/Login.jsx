import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Sprout, Users, MapPin } from 'lucide-react';
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
        remember: false,
    });

    const [role, setRole] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('taniarang_user_role') || 'petani';
        }
        return 'petani';
    });

    const [communityAddress, setCommunityAddress] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('taniarang_community_address') || '';
        }
        return '';
    });

    const submit = (e) => {
        e.preventDefault();

        try {
            localStorage.setItem('taniarang_user_role', role);
            if (role === 'komunitas' && communityAddress.trim()) {
                localStorage.setItem('taniarang_community_address', communityAddress.trim());
            }
        } catch (err) {}

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk ke TaniArang" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">
                    Masuk ke TaniArang
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                    Silakan masuk untuk melanjutkan pencatatan dan panduan pirolisis biomassa.
                </p>
            </div>

            {status && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Role Selection (R1) */}
                <div>
                    <InputLabel value="Peran Akses Pengguna *" />
                    <div className="grid grid-cols-2 gap-3 mt-1.5" role="radiogroup" aria-label="Pilihan Peran Masuk">
                        <button
                            type="button"
                            role="radio"
                            aria-checked={role === 'petani'}
                            onClick={() => setRole('petani')}
                            className={`p-3 rounded-xl border text-left transition-all min-h-[52px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                role === 'petani'
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                                    : 'border-stone-300 dark:border-carbon-700 bg-white dark:bg-carbon-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-carbon-800'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    role === 'petani'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-stone-200 dark:bg-carbon-800 text-stone-600 dark:text-stone-400'
                                }`}>
                                    <Sprout className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-sm">Petani</span>
                            </div>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-tight">
                                Produsen residu biomassa
                            </span>
                        </button>

                        <button
                            type="button"
                            role="radio"
                            aria-checked={role === 'komunitas'}
                            onClick={() => setRole('komunitas')}
                            className={`p-3 rounded-xl border text-left transition-all min-h-[52px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                role === 'komunitas'
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                                    : 'border-stone-300 dark:border-carbon-700 bg-white dark:bg-carbon-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-carbon-800'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    role === 'komunitas'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-stone-200 dark:bg-carbon-800 text-stone-600 dark:text-stone-400'
                                }`}>
                                    <Users className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-sm">Komunitas</span>
                            </div>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-tight">
                                Sentra & hub pirolisis
                            </span>
                        </button>
                    </div>
                </div>

                {/* Conditional Community Address Field (R1) */}
                {role === 'komunitas' && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-carbon-800/80 border border-amber-200 dark:border-carbon-700 transition-all">
                        <InputLabel
                            htmlFor="community_address"
                            value="Alamat Sentra Komunitas Terdaftar"
                            className="flex items-center gap-1.5"
                        >
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Alamat Sentra Komunitas Terdaftar
                        </InputLabel>
                        <TextInput
                            id="community_address"
                            name="community_address"
                            value={communityAddress}
                            onChange={(e) => setCommunityAddress(e.target.value)}
                            placeholder="Alamat sentra tersimpan (opsional)"
                            className="mt-1.5 block w-full"
                        />
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                            Disimpan di perangkat Anda untuk identitas sentra penerimaan limbah.
                        </p>
                    </div>
                )}

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
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
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
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Remember Me Checkbox */}
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
                            href={route('password.request')}
                            className="text-xs text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline transition"
                        >
                            Lupa sandi?
                        </Link>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Link
                        href={route('register')}
                        className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline transition"
                    >
                        Belum punya akun? Buat akun baru
                    </Link>

                    <PrimaryButton className="w-full sm:w-auto" disabled={processing}>
                        Masuk Sekarang
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
