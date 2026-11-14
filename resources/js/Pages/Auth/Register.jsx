import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Sprout, Users, MapPin } from 'lucide-react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [role, setRole] = useState('petani'); // 'petani' | 'komunitas'
    const [communityAddress, setCommunityAddress] = useState('');
    const [addressError, setAddressError] = useState('');

    const submit = (e) => {
        e.preventDefault();

        if (role === 'komunitas' && !communityAddress.trim()) {
            setAddressError('Alamat sentra komunitas wajib diisi.');
            return;
        }

        try {
            localStorage.setItem('taniarang_user_role', role);
            if (role === 'komunitas') {
                localStorage.setItem('taniarang_community_address', communityAddress.trim());
            } else {
                localStorage.removeItem('taniarang_community_address');
            }
        } catch (err) {}

        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun TaniArang" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">
                    Daftar Akun TaniArang
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                    Pilih peran Anda dan mulai kelola limbah pertanian menjadi biochar.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Role Selection (R1) */}
                <div>
                    <InputLabel value="Pilih Peran Pengguna *" />
                    <div className="grid grid-cols-2 gap-3 mt-1.5" role="radiogroup" aria-label="Pilihan Peran">
                        <button
                            type="button"
                            role="radio"
                            aria-checked={role === 'petani'}
                            onClick={() => {
                                setRole('petani');
                                setAddressError('');
                            }}
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
                                Produsen limbah & residu
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

                {/* Conditional Community Address Input (R1) */}
                {role === 'komunitas' && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-carbon-800/80 border border-amber-200 dark:border-carbon-700 transition-all">
                        <InputLabel
                            htmlFor="community_address"
                            value="Alamat Komunitas / Sentra Pirolisis *"
                            className="flex items-center gap-1.5"
                        >
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Alamat Komunitas / Sentra Pirolisis *
                        </InputLabel>
                        <textarea
                            id="community_address"
                            name="community_address"
                            rows={3}
                            value={communityAddress}
                            onChange={(e) => {
                                setCommunityAddress(e.target.value);
                                if (addressError) setAddressError('');
                            }}
                            placeholder="Contoh: Jl. Raya Agropolitan No. 12, Pujon, Kab. Malang, Jawa Timur"
                            className="mt-1.5 block w-full rounded-xl border border-stone-300 dark:border-carbon-700 bg-white dark:bg-carbon-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-3 transition-colors"
                            required={role === 'komunitas'}
                        />
                        {addressError ? (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{addressError}</p>
                        ) : (
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                                Digunakan sebagai titik sentra tujuan setor limbah dari petani sekitar.
                            </p>
                        )}
                    </div>
                )}

                {/* Name Field */}
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap *" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Confirm Password Field */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi *" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                {/* Footer Controls */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Link
                        href="/login"
                        className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline transition"
                    >
                        Sudah punya akun? Masuk
                    </Link>

                    <PrimaryButton className="w-full sm:w-auto" disabled={processing}>
                        Daftar Sekarang
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
