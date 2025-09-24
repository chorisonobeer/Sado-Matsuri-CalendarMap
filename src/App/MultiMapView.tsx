/** 
 * /src/App/MultiMapView.tsx
 * 2025-01-25T10:00+09:00
 * 変更概要: 新規追加 - 複数イベント対応地図表示コンポーネント（検索画面用）
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './MapView.scss';

interface MultiMapViewProps {
  events: Pwamap.FestivalData[];
  selectedEvent: Pwamap.FestivalData | null;
  onEventSelect: (event: Pwamap.FestivalData) => void;
}

const MultiMapView: React.FC<MultiMapViewProps> = ({ 
  events, 
  selectedEvent, 
  onEventSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 地図の初期化
  const initializeMap = useCallback(() => {
    if (!mapRef.current) return;

    const mapOptions: google.maps.MapOptions = {
      center: { lat: 38.0195, lng: 138.2570 }, // 佐渡島の中心
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
  }, []);

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
  }, [initializeMap]);

  // マーカーの作成
  const createMarker = useCallback((event: Pwamap.FestivalData) => {
    if (!mapInstanceRef.current || !event.緯度 || !event.経度) return null;

    const lat = parseFloat(event.緯度);
    const lng = parseFloat(event.経度);

    if (isNaN(lat) || isNaN(lng)) return null;

    const position = { lat, lng };
    const isSelected = selectedEvent?.お祭り名 === event.お祭り名;

    const marker = new google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title: event.お祭り名,
      animation: google.maps.Animation.DROP,
      icon: {
        url: isSelected 
          ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#ff4444" stroke="#ffffff" stroke-width="3"/>
              <circle cx="16" cy="16" r="6" fill="#ffffff"/>
            </svg>
          `)
          : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#4285f4" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" fill="#ffffff"/>
            </svg>
          `),
        scaledSize: new google.maps.Size(isSelected ? 32 : 24, isSelected ? 32 : 24),
        anchor: new google.maps.Point(isSelected ? 16 : 12, isSelected ? 16 : 12)
      }
    });

    // マーカークリックイベント
    marker.addListener('click', () => {
      onEventSelect(event);
    });

    return marker;
  }, [selectedEvent, onEventSelect]);

  // イベントリストが変更された時のマーカー更新
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // 既存のマーカーをクリア
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current.clear();

    // 新しいマーカーを作成
    events.forEach((event, index) => {
      const marker = createMarker(event);
      if (marker) {
        const key = `${event.お祭り名}-${index}`;
        markersRef.current.set(key, marker);
      }
    });

    // 地図の表示範囲を調整
    if (events.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      let hasValidCoords = false;

      events.forEach(event => {
        if (event.緯度 && event.経度) {
          const lat = parseFloat(event.緯度);
          const lng = parseFloat(event.経度);
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend({ lat, lng });
            hasValidCoords = true;
          }
        }
      });

      if (hasValidCoords) {
        mapInstanceRef.current.fitBounds(bounds);
        // ズームレベルが高すぎる場合は調整
        const listener = google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
          if (mapInstanceRef.current!.getZoom()! > 15) {
            mapInstanceRef.current!.setZoom(15);
          }
          google.maps.event.removeListener(listener);
        });
      }
    }
  }, [events, isMapLoaded, createMarker]);

  // 選択されたイベントが変更された時のマーカー更新
  useEffect(() => {
    if (!isMapLoaded) return;

    // 全マーカーを再作成（選択状態の表示を更新するため）
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current.clear();

    events.forEach((event, index) => {
      const marker = createMarker(event);
      if (marker) {
        const key = `${event.お祭り名}-${index}`;
        markersRef.current.set(key, marker);
      }
    });

    // 選択されたイベントがある場合、そのマーカーを中心に表示
    if (selectedEvent && selectedEvent.緯度 && selectedEvent.経度) {
      const lat = parseFloat(selectedEvent.緯度);
      const lng = parseFloat(selectedEvent.経度);
      if (!isNaN(lat) && !isNaN(lng) && mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat, lng });
      }
    }
  }, [selectedEvent, isMapLoaded, events, createMarker]);

  // コンポーネントのクリーンアップ
  useEffect(() => {
    const currentMarkersRef = markersRef.current;
    return () => {
      currentMarkersRef.forEach(marker => {
        marker.setMap(null);
      });
      currentMarkersRef.clear();
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
      {isMapLoaded && events.length === 0 && (
        <div className="map-no-events">
          <p>表示するイベントがありません</p>
        </div>
      )}
    </div>
  );
};

export default MultiMapView;