"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getChingus } from "@/api/chingus";
import {  EmeraldIcon } from "@/components/map/EmeraldIcon";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 3, { animate: false });
    }
  }, [center, map]);
  return null;
}

export default function MapPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([20, 0]); 

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getChingus();
        const markers = (result || []).filter(
          (c) => c.coordinates?.lat && c.coordinates?.lng
        );

        if (markers.length > 0) {
          
          const total = markers.reduce(
            (acc, m) => {
              acc.lat += m.coordinates.lat;
              acc.lng += m.coordinates.lng;
              return acc;
            },
            { lat: 0, lng: 0 }
          );

          const center = [
            total.lat / markers.length,
            total.lng / markers.length,
          ];

          setMapCenter(center);
        }

        setData(result || []);
      } catch (error) {
        console.error("Failed to fetch chingus:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading map...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="p-8 text-center">No data available</div>;
  }

  const validMarkers = data.filter(
    (c) => c.coordinates?.lat && c.coordinates?.lng
  );

  if (validMarkers.length === 0) {
    return <div className="p-8 text-center">No valid coordinates found</div>;
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={3} 
      scrollWheelZoom={true}
      style={{ height: "100vh", width: "100%" }}
      className="z-0"
      worldCopyJump={true} 
      maxBounds={[
        [-80, -170],
        [80, 190],
      ]} 
      maxBoundsViscosity={0.8} 
    >
      
      <MapController center={mapCenter} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={10}
      />

      {validMarkers.map((item, index) => (
        <Marker
          key={`${item.countryCode}-${index}`}
          position={[item.coordinates.lat, item.coordinates.lng]}
          icon={EmeraldIcon}
        >
          <Tooltip
            direction="top"
            offset={[0, -10]}
            opacity={1}
            permanent={false}
          >
            <div className="text-center text-xs leading-tight">
              <strong>{item.countryName || "Unknown"}</strong>
              <br />
              Count: <strong>{item.count ?? 0}</strong>
              <br />
              <span className="text-gray-600">{item.countryCode}</span>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}