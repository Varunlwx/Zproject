'use client';

import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { products } from '@/data/products';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { useRouter } from 'next/navigation';

export default function SyncPage() {
    const { isAdminAuthenticated, isLoading } = useAdminAuth();
    const [isSyncing, setIsSyncing] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number; log: string[] }>({
        current: 0,
        total: products.length,
        log: []
    });
    const router = useRouter();

    if (isLoading) return <div className="p-8 text-white">Loading...</div>;

    if (!isAdminAuthenticated) {
        return (
            <div className="p-8 text-white">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p>Please login as admin to access this page.</p>
                <button
                    onClick={() => router.push('/admin')}
                    className="mt-4 px-4 py-2 bg-blue-600 rounded text-white"
                >
                    Back to Login
                </button>
            </div>
        );
    }

    const startSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        const log: string[] = [];

        try {
            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                const docRef = doc(db, 'products', product.id);

                await setDoc(docRef, {
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice || '',
                    tag: product.tag || '',
                    category: product.category,
                    subcategory: product.subcategory,
                    image: product.image,
                    images: product.images,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                    description: product.description,
                    sizes: product.sizes,
                    updatedAt: serverTimestamp()
                }, { merge: true });

                const msg = `✅ Synced: ${product.name} (${product.id})`;
                log.unshift(msg);
                setProgress({
                    current: i + 1,
                    total: products.length,
                    log: [...log]
                });
            }
            log.unshift('🏁 Sync Completed Successfully!');
            setProgress(prev => ({ ...prev, log: [...log] }));
        } catch (error: any) {
            console.error('Sync Error:', error);
            log.unshift(`❌ Error: ${error.message}`);
            setProgress(prev => ({ ...prev, log: [...log] }));
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <div className="max-w-2xl mx-auto bg-[#1e293b] rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Product Sync</h1>
                        <p className="text-white/60 mt-2">Migrate static products to Firestore Database</p>
                    </div>
                    <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
                        ADMIN ONLY
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/5">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Sync Progress</span>
                        <span>{progress.current} / {progress.total} Products</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-blue-500 h-full transition-all duration-300 ease-out"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <button
                    onClick={startSync}
                    disabled={isSyncing}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isSyncing
                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                >
                    {isSyncing ? 'SYNCING DATA...' : 'START MIGRATION'}
                </button>

                <div className="mt-12">
                    <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Sync Logs</h2>
                    <div className="bg-black/40 rounded-xl p-4 h-64 overflow-y-auto font-mono text-sm border border-white/5 space-y-2">
                        {progress.log.length > 0 ? (
                            progress.log.map((entry, idx) => (
                                <div key={idx} className={`${entry.startsWith('✅') ? 'text-green-400' :
                                        entry.startsWith('❌') ? 'text-red-400' :
                                            'text-blue-300 font-bold'
                                    }`}>
                                    {entry}
                                </div>
                            ))
                        ) : (
                            <div className="text-white/20 italic">No sync activity yet. Click Start Migration to begin.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
