'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Plus, Store, ArrowRight, Loader2 } from "lucide-react";

// Dynamic import for map to avoid SSR issues
const MapWrapper = dynamic(() => import("@/components/exchange/MapWrapper"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-secondary/50 animate-pulse flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        </div>
    ),
});

interface ExchangePoint {
    id: string;
    name: string;
    description: string | null;
    location: string;
    latitude: number;
    longitude: number;
    status: string | null;
}

export default function ExchangePointsPage() {
    const [points, setPoints] = useState<ExchangePoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPoints() {
            try {
                const res = await fetch('/api/exchange-points');
                const data = await res.json();
                if (data.success) {
                    setPoints(data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch exchange points:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPoints();
    }, []);

    return (
        <div className="min-h-screen bg-background pt-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                >
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                            className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center"
                        >
                            <Store className="w-6 h-6 text-accent" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                Exchange Points
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Discover trusted book stalls near you
                            </p>
                        </div>
                    </div>

                    <Link href="/exchange-points/new">
                        <motion.div
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold shadow-lg shadow-accent/20 cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <Plus className="w-4 h-4" />
                            Register New Stall
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Map Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl h-[450px] relative mb-10"
                >
                    <MapWrapper points={points} mode="view" />
                    <div className="absolute top-4 left-4 z-[400] bg-background/90 backdrop-blur-md px-4 py-2 rounded-xl border border-border shadow-lg">
                        <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            {loading ? '...' : points.length} Active Stalls
                        </span>
                    </div>
                </motion.div>

                {/* Stalls List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-accent rounded-full" />
                        <h2 className="text-xl font-bold text-foreground">Nearby Stalls</h2>
                    </div>

                    {loading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                                    <div className="flex justify-between mb-4">
                                        <div className="w-10 h-10 bg-secondary rounded-xl" />
                                        <div className="w-16 h-6 bg-secondary rounded-full" />
                                    </div>
                                    <div className="h-6 bg-secondary rounded-lg w-3/4 mb-3" />
                                    <div className="h-4 bg-secondary rounded-lg w-full mb-2" />
                                    <div className="h-4 bg-secondary rounded-lg w-2/3" />
                                </div>
                            ))}
                        </div>
                    ) : points.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {points.map((point, i) => (
                                <motion.div
                                    key={point.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                >
                                    <Link href={`/exchange-points/${point.id}`}>
                                        <motion.div
                                            className="group bg-card hover:bg-secondary/30 border border-border hover:border-accent/30 rounded-2xl p-5 transition-all duration-300 h-full flex flex-col cursor-pointer"
                                            whileHover={{ y: -4 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                                                    <MapPin className="w-5 h-5 text-accent" />
                                                </div>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${(point.status || 'ACTIVE') === 'ACTIVE'
                                                        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                                                        : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {point.status || 'Active'}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-accent transition-colors line-clamp-1">
                                                {point.name}
                                            </h3>

                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                                                {point.description || "No description provided."}
                                            </p>

                                            <div className="pt-4 border-t border-border/50 flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground max-w-[65%]">
                                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span className="truncate text-xs">{point.location}</span>
                                                </div>
                                                <span className="text-accent font-medium text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    View <ArrowRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/20"
                        >
                            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                                <Store className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-foreground">No Stalls Found</h3>
                            <p className="text-muted-foreground max-w-md mb-6">
                                Be the first to register a book stall in your area!
                            </p>
                            <Link href="/exchange-points/new">
                                <motion.div
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold cursor-pointer"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Register First Stall
                                </motion.div>
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
