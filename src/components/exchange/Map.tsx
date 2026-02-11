"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

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

function LocationMarker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

// Custom hook/component to handle geolocation
function LocateController({ autoLocate }: { autoLocate: boolean }) {
    const map = useMapEvents({
        locationfound(e) {
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (autoLocate) {
            map.locate({ setView: true, maxZoom: 16 });
        }
    }, [map, autoLocate]);

    const handleLocateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault(); // Prevent map click propagation
        map.locate({ setView: true, maxZoom: 16 });
    };

    return (
        <div className="leaflet-bottom leaflet-right">
            <div className="leaflet-control leaflet-bar">
                <button
                    onClick={handleLocateClick}
                    className="bg-white hover:bg-gray-100 text-black w-8 h-8 flex items-center justify-center border-none cursor-pointer"
                    title="Locate me"
                    style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" /></svg>
                    {/* Simple crosshair icon manually SVG'd to avoid heavy imports just for this */}
                    <span className="sr-only">Locate Me</span>
                </button>
            </div>
        </div>
    );
}

export default function Map({ points = [], mode = "view", onLocationSelect, initialCenter = [51.505, -0.09] }: MapProps) {
    // Only auto-locate in view mode or if specifically desired in pick mode (usually yes)
    // We'll enable it by default.
    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border z-0 relative">
            <MapContainer center={initialCenter} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mode === "view" && points.map((point) => (
                    <Marker key={point.id} position={[point.latitude, point.longitude]}>
                        <Popup>
                            <div className="min-w-[200px]">
                                <h3 className="font-bold text-lg">{point.name}</h3>
                                {point.description && <p className="text-sm text-muted-foreground mb-2">{point.description}</p>}

                                {point.owner && (
                                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                                        <span>Managed by {point.owner.name}</span>
                                    </div>
                                )}

                                {point.contactMethod && point.contactValue && (
                                    <div className="mt-2 pt-2 border-t text-sm">
                                        <strong>Contact:</strong>
                                        <span className="block">{point.contactMethod}: {point.contactValue}</span>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {mode === "pick" && onLocationSelect && (
                    <LocationMarker onSelect={onLocationSelect} />
                )}

                <LocateController autoLocate={true} />
            </MapContainer>
        </div>
    );
}
