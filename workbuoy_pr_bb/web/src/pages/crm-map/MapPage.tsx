import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = process.env.MAPBOX_TOKEN || '';

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: process.env.MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v11',
      center: [10.75, 59.91],
      zoom: 3
    });
    return () => map.remove();
  }, []);
  return <div style={{width:'100%',height:'100%'}} ref={mapRef}/>;
}
