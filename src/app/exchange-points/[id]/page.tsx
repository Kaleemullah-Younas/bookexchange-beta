'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, Clock, User, Loader2, Store } from "lucide-react";

// Dynamic import for map
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
    contactMethod: string | null;
    contactValue: string | null;
    createdAt: string;
    owner: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    } | null;
}

export default function ExchangePointDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [point, setPoint] = useState<ExchangePoint | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPoint() {
            try {
                const res = await fetch(`/api/exchange-points/${params.id}`);
                const data = await res.json();
                if (data.success && data.data) {
                    setPoint(data.data);
                } else {
                    router.push('/exchange-points');
                }
            } catch (error) {
                console.error('Failed to fetch exchange point:', error);
                router.push('/exchange-points');
            } finally {
                setLoading(false);
            }
        }
        if (params.id) {
            fetchPoint();
        }
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="animate-pulse">
                        <div className="h-6 w-32 bg-secondary rounded-lg mb-8" />
                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-card border border-border rounded-2xl p-8">
                                    <div className="h-8 w-24 bg-secondary rounded-full mb-4" />
                                    <div className="h-10 w-3/4 bg-secondary rounded-lg mb-4" />
                                    <div className="h-6 w-1/2 bg-secondary rounded-lg" />
                                </div>
                                <div className="bg-card border border-border rounded-2xl h-[350px]" />
                            </div>
                            <div className="space-y-6">
                                <div className="bg-card border border-border rounded-2xl p-6 h-40" />
                                <div className="bg-card border border-border rounded-2xl p-6 h-48" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!point) return null;

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href="/exchange-points"
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent mb-8 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Stalls
                    </Link>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden"
                        >
                            {/* Background Icon */}
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Store className="w-32 h-32" />
                            </div>

                            <div className="relative z-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-4 border border-accent/20"
                                >
                                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                    {point.status || 'Active Stall'}
                                </motion.div>

                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                                    {point.name}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-accent" />
                                        <span>{point.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>Added {new Date(point.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-card border border-border rounded-2xl p-8"
                        >
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                                <div className="w-1 h-6 bg-accent rounded-full" />
                                About this Stall
                            </h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {point.description || "The owner hasn't provided a description for this stall yet. Stop by to check out their collection!"}
                            </p>
                        </motion.div>

                        {/* Map */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card border border-border rounded-2xl overflow-hidden h-[350px] relative"
                        >
                            <MapWrapper
                                points={[{
                                    ...point,
                                    owner: point.owner ?? undefined
                                }]}
                                mode="view"
                                initialCenter={[point.latitude, point.longitude]}
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 z-[400] pointer-events-none">
                                <p className="text-sm font-medium text-foreground text-center">
                                    📍 Exact location on the map
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Sticky */}
                    <div className="space-y-6">
                        <div className="lg:sticky lg:top-28">
                            {/* Owner Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-card border border-border rounded-2xl p-6 mb-6"
                            >
                                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                    Maintained By
                                </h2>
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-xl font-bold text-accent border-2 border-accent/20 overflow-hidden"
                                    >
                                        {point.owner?.image ? (
                                            <img
                                                src={point.owner.image}
                                                alt={point.owner.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6" />
                                        )}
                                    </motion.div>
                                    <div>
                                        <p className="font-bold text-lg text-foreground">
                                            {point.owner?.name || 'Unknown User'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {point.owner?.email}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Contact Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-card border border-border rounded-2xl p-6"
                            >
                                <h2 className="text-lg font-bold mb-6 text-foreground">Contact Owner</h2>

                                <div className="space-y-3">
                                    {point.contactMethod === "EMAIL" && point.contactValue && (
                                        <motion.a
                                            href={`mailto:${point.contactValue}`}
                                            className="flex items-center justify-center gap-2 w-full bg-accent text-accent-foreground p-4 rounded-xl font-semibold transition-all shadow-lg shadow-accent/20"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Mail className="w-5 h-5" />
                                            Send Email
                                        </motion.a>
                                    )}

                                    {point.contactMethod === "PHONE" && point.contactValue && (
                                        <motion.a
                                            href={`tel:${point.contactValue}`}
                                            className="flex items-center justify-center gap-2 w-full bg-secondary text-foreground p-4 rounded-xl font-semibold transition-all border border-border"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Phone className="w-5 h-5" />
                                            Call Number
                                        </motion.a>
                                    )}

                                    {(!point.contactMethod || !point.contactValue) && (
                                        <div className="p-4 bg-secondary/50 rounded-xl text-center text-muted-foreground text-sm">
                                            No contact method available
                                        </div>
                                    )}

                                    <p className="text-xs text-center text-muted-foreground pt-2">
                                        Please be respectful when contacting stall owners.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}