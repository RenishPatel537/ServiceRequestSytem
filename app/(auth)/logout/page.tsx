'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        const performLogout = async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        };
        performLogout();
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Logging out...</p>
        </div>
    );
}
