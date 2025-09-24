/** 
 * /src/App/MapView.tsx
 * 2025-01-14T16:10+09:00
 * 変更概要: 新規追加 - Google Maps JavaScript API地図表示コンポーネント（DROP動画効果付きマーカー）
 */

import React, { useEffect, useRef, useState } from 'react';
import './MapView.scss';

interface MapViewProps {
  selectedEvent: Pwamap.FestivalData | null | undefined;
  onMarkerUpdate: (marker: google.maps.Marker | null) => void;
}

const MapView: React.FC<MapViewProps> = ({ selectedEvent, onMarkerUpdate }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const currentMarkerRef = useRef<google.maps.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Google Maps APIの読み込み
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key is not set');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // 地図の初期化
  const initializeMap = () => {
    if (!mapRef.current) return;

    const mapOptions: google.maps.MapOptions = {
      center: { lat: 38.0195, lng: 138.2570 },
      zoom: 10,
      disableDefaultUI: true,
      gestureHandling: 'cooperative',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
    setIsMapLoaded(true);
  };

  // 選択されたイベントが変更された時のマーカー更新
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // 既存のマーカーを削除
    if (currentMarkerRef.current) {
      currentMarkerRef.current.setMap(null);
      currentMarkerRef.current = null;
    }

    // 新しいマーカーを追加
    if (selectedEvent && selectedEvent.緯度 && selectedEvent.経度) {
      const lat = parseFloat(selectedEvent.緯度);
      const lng = parseFloat(selectedEvent.経度);

      if (!isNaN(lat) && !isNaN(lng)) {
        const position = { lat, lng };
        
        const marker = new google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          animation: google.maps.Animation.DROP,
          title: selectedEvent.お祭り名
        });

        // マップの中心をマーカーの位置に移動し、適切なズームレベルに設定
        mapInstanceRef.current.setCenter(position);
        mapInstanceRef.current.setZoom(14);

        currentMarkerRef.current = marker;
        onMarkerUpdate(marker);
      }
    } else {
      onMarkerUpdate(null);
    }
  }, [selectedEvent, isMapLoaded, onMarkerUpdate]);

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (currentMarkerRef.current) {
        currentMarkerRef.current.setMap(null);
      }
    };
  }, []);

  return (
    <div className="map-view">
      <div 
        ref={mapRef} 
        className="map-container"
        style={{ width: '100%', height: '100%' }}
      />
      {!isMapLoaded && (
        <div className="map-loading">
          <div className="loading-spinner">地図を読み込み中...</div>
        </div>
      )}
    </div>
  );
};

export default MapView;