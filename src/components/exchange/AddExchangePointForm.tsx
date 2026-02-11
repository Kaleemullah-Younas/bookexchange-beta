"use client";

import { createExchangePoint } from "@/app/exchange-points/actions";
import dynamic from "next/dynamic";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Dynamically import Map with no SSR
import MapWrapper from "@/components/exchange/MapWrapper";

const initialState: { message: string, success: boolean, errors?: Record<string, string[]> } = {
    message: "",
    success: false,
    errors: undefined
};

export default function AddExchangePointForm({ ownerId }: { ownerId: string }) {
    const [state, formAction, isPending] = useActionState(createExchangePoint, initialState);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const router = useRouter();

    const handleLocationSelect = (lat: number, lng: number) => {
        setLocation({ lat, lng });
    };

    return (
        <form action={formAction} className="space-y-8">
            {/* Location Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold">1</span>
                        Pick Location
                    </h3>
                    <p className="text-sm text-muted-foreground ml-8">Tap on the map to set the stall's exact position.</p>
                </div>

                <div className="rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-accent/50 transition-colors">
                    <MapWrapper mode="pick" onLocationSelect={handleLocationSelect} />
                </div>

                {location && (
                    <div className="grid grid-cols-2 gap-4 mt-4 ml-8">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Latitude</label>
                            <div className="mt-1 font-mono text-sm bg-muted/50 p-2 rounded-lg border border-border">
                                {location.lat.toFixed(6)}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Longitude</label>
                            <div className="mt-1 font-mono text-sm bg-muted/50 p-2 rounded-lg border border-border">
                                {location.lng.toFixed(6)}
                            </div>
                        </div>
                    </div>
                )}
                <input type="hidden" name="latitude" value={location?.lat || ''} />
                <input type="hidden" name="longitude" value={location?.lng || ''} />
                {state.errors?.latitude && <p className="text-destructive text-sm mt-1">Please select a location on the map.</p>}
            </div>

            {/* Basic Info Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold">2</span>
                        Stall Details
                    </h3>
                </div>

                <div className="space-y-6 ml-8">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold mb-2">Stall Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="e.g. Baker St. Community Exchange"
                            className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent transition-all outline-none shadow-sm"
                        />
                        {state.errors?.name && <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold mb-2">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Tell people about what kind of books usually flow through here..."
                            className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent transition-all outline-none shadow-sm resize-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-semibold mb-2">Address/Location Name</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            required
                            className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent transition-all outline-none shadow-sm"
                            placeholder="e.g. 123 Main St, Near Park Entrance"
                        />
                        {state.errors?.location && <p className="text-destructive text-sm mt-1">{state.errors.location[0]}</p>}
                    </div>
                </div>
            </div>

            {/* Contact Info Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold">3</span>
                        Contact Info
                    </h3>
                    <p className="text-sm text-muted-foreground ml-8">How should people reach you with questions?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Preferred Method</label>
                        <div className="flex gap-4">
                            <label className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="contactMethod"
                                    value="EMAIL"
                                    defaultChecked
                                    className="peer sr-only"
                                />
                                <div className="text-center p-3 rounded-xl border border-border peer-checked:bg-accent/10 peer-checked:border-accent peer-checked:text-accent font-medium transition-all">
                                    Email
                                </div>
                            </label>
                            <label className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="contactMethod"
                                    value="PHONE"
                                    className="peer sr-only"
                                />
                                <div className="text-center p-3 rounded-xl border border-border peer-checked:bg-accent/10 peer-checked:border-accent peer-checked:text-accent font-medium transition-all">
                                    Phone
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="contactValue" className="block text-sm font-semibold mb-2">Contact Value</label>
                        <input
                            type="text"
                            id="contactValue"
                            name="contactValue"
                            required
                            placeholder="email@example.com or +1 234..."
                            className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent transition-all outline-none shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <input type="hidden" name="ownerId" value={ownerId} />

            {state.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${state.success ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border`}>
                    {state.success ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    )}
                    <span className="font-medium">{state.message}</span>
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isPending || !location}
                    className="bg-accent text-accent-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/20 w-full md:w-auto flex items-center justify-center gap-2"
                >
                    {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isPending ? 'Creating Stall...' : 'Create Exchange Point'}
                </button>
            </div>
        </form>
    );
}
