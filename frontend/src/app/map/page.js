"use client"
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("../../components/map/MapComponent"),
  {
    ssr: false,
  }
);

export default function MapPage() {
  return <MapComponent />;
}
