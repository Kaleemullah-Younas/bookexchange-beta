"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

// Dynamically import Map with no SSR
const ExchangeMap = dynamic(() => import("./Map"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

interface Point {
    id: string;
    name: string;
    description?: string | null;
    latitude: number;
    longitude: number;
    contactMethod?: string | null;
    contactValue?: string | null;
    owner?: {
        name: string;
        image: string | null;
    };
}

interface MapProps {
    points?: Point[];
    mode?: "view" | "pick";
    onLocationSelect?: (lat: number, lng: number) => void;
    initialCenter?: [number, number];
}

export default function MapWrapper(props: MapProps) {
    return <ExchangeMap {...props} />;
}
