'use client';

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AddExchangePointForm from "@/components/exchange/AddExchangePointForm";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

export default function NewExchangePointPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/signin?callbackUrl=/exchange-points/new");
        }
    }, [session, isPending, router]);

    if (isPending) {
        return (
            <div className="min-h-screen bg-background pt-24">
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    <div className="animate-pulse">
                        <div className="h-6 w-32 bg-secondary rounded-lg mb-8" />
                        <div className="bg-card border border-border rounded-2xl p-8">
                            <div className="h-8 w-48 bg-secondary rounded-lg mb-2" />
                            <div className="h-4 w-64 bg-secondary rounded-lg mb-8" />
                            <div className="space-y-4">
                                <div className="h-12 bg-secondary rounded-xl" />
                                <div className="h-12 bg-secondary rounded-xl" />
                                <div className="h-32 bg-secondary rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
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

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 sm:p-8 border-b border-border bg-secondary/30">
                        <div className="flex items-center gap-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                                className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center"
                            >
                                <MapPin className="w-6 h-6 text-accent" />
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Register New Stall
                                </h1>
                                <p className="text-muted-foreground text-sm">
                                    Add your book exchange point to the map
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 sm:p-8">
                        <AddExchangePointForm ownerId={session.user.id} />
                    </div>
                </motion.div>

                {/* Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-4 bg-secondary/30 rounded-xl border border-border/50"
                >
                    <h3 className="font-semibold text-sm text-foreground mb-2">💡 Tips for a great listing</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Choose a descriptive name that&apos;s easy to find</li>
                        <li>• Add clear location details and landmarks</li>
                        <li>• Include your operating hours in the description</li>
                        <li>• Provide a reliable contact method</li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
}
