"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { useBackendAuth } from "@/hooks/useBackendAuth";

import { getChingus } from "@/api/chingus";
import {  EmeraldIcon } from "@/components/map/EmeraldIcon";
import { useFilter } from "@/context/FilterProvider";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
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
  const [error, setError] = useState(null);
  const {filters,searchTrigger} = useFilter();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useBackendAuth();

  async function fetchData(data={}) {
    try {
      setError(null);
      
      // Transform filter params to match backend API for aggregate-by-country endpoint
      const params = {};
      
      // Only include non-empty filter values
      if (data.gender) {
        params.gender = data.gender;
      }
      if (data.yearJoined) {
        params.yearJoined = data.yearJoined;
      }
      if (data.roleType) {
        params.roleType = data.roleType;
      }
      // Backend aggregate endpoint uses 'role' not 'voyageRole'
      if (data.voyageRole) {
        params.role = data.voyageRole;
      }
      // For aggregate-by-country, backend expects 'countryCode[]' format
      if (data.countryCode && data.countryCode.length > 0) {
        params['countryCode[]'] = data.countryCode;
      }
      if (data.soloProjectTier) {
        params.soloProjectTier = data.soloProjectTier;
      }
      if (data.voyageTier) {
        params.voyageTier = data.voyageTier;
      }
      if (data.voyage) {
        params.voyage = data.voyage;
      }
      
      const result = await getChingus(params);
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
      
      // Check for authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError("authentication");
      } else {
        setError("general");
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{
    fetchData();
  },[]);


  useEffect(() => {
    if(searchTrigger === 0) return;
    fetchData(filters);
  }, [searchTrigger]);

  // Check authentication status
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setError("authentication");
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading map...
      </div>
    );
  }

  // Show authentication error
  if (error === "authentication") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access the map. Please sign in to continue.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show general error
  if (error === "general") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Load Map
          </h2>
          <p className="text-gray-600 mb-6">
            We're having trouble loading the map data. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Retry
          </button>
        </div>
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
