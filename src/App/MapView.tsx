/**
 * /src/App/MapView.tsx
 * 2025-01-25T19:30+09:00
 * 変更概要: Google MapsからGeolonia Mapsに移行 - 単一マーカー表示コンポーネント
 */

import React, { useEffect, useRef, useState } from 'react';
import './MapView.scss';

interface MapViewProps {
  selectedEvent: Pwamap.FestivalData | null | undefined;
  onMarkerUpdate: (marker: any) => void; // Geolonia Markerに対応
}

const MapView: React.FC<MapViewProps> = ({ selectedEvent, onMarkerUpdate }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // geolonia.Map
  const currentMarkerRef = useRef<any>(null); // geolonia.Marker
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Geolonia Maps APIの読み込み確認と地図初期化
  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Geolonia APIが利用可能かチェック
      if (!window.geolonia) {
        console.error('Geolonia API is not loaded');
        return;
      }

      try {
        // 佐渡島の中心座標
        const defaultCenter: [number, number] = [138.3667, 37.8667]; // [lng, lat]
        const defaultZoom = parseInt(process.env.REACT_APP_ZOOM || '10');

        // Geolonia地図の初期化
        mapInstanceRef.current = new window.geolonia.Map({
          container: mapRef.current,
          style: 'geolonia/basic', // 基本スタイル
          center: defaultCenter,
          zoom: defaultZoom,
          attributionControl: true
        });

        // 地図読み込み完了イベント
        mapInstanceRef.current.on('load', () => {
          console.log('Geolonia map loaded successfully');
          setIsMapLoaded(true);
        });

        // エラーハンドリング
        mapInstanceRef.current.on('error', (e: any) => {
          console.error('Geolonia map error:', e);
        });

      } catch (error) {
        console.error('Failed to initialize Geolonia map:', error);
      }
    };

    // Geolonia APIの読み込み待機
    const checkGeoloniaAPI = () => {
      if (window.geolonia) {
        initializeMap();
      } else {
        // APIが読み込まれるまで待機
        setTimeout(checkGeoloniaAPI, 100);
      }
    };

    checkGeoloniaAPI();

    // クリーンアップ
    return () => {
      if (currentMarkerRef.current) {
        currentMarkerRef.current.remove();
        currentMarkerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 選択されたイベントに基づいてマーカーを更新
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !selectedEvent) return;

    // 既存のマーカーを削除
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
      currentMarkerRef.current = null;
    }

    // 緯度経度の取得と検証
    const lat = parseFloat(selectedEvent.緯度);
    const lng = parseFloat(selectedEvent.経度);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates for event:', selectedEvent.お祭り名);
      return;
    }

    try {
      // 新しいマーカーを作成
      const marker = new window.geolonia.Marker({
        color: '#FF0000', // 赤色のマーカー
        scale: 1.2 // 少し大きめに表示
      })
        .setLngLat([lng, lat]) // Geoloniaは [lng, lat] の順序
        .addTo(mapInstanceRef.current);

      // GoogleMap風のDropアニメーション効果を追加
      const markerElement = marker.getElement();
      markerElement.style.transform = 'translateY(-100px)';
      markerElement.style.opacity = '0';
      markerElement.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease-in';
      
      // アニメーション開始
      setTimeout(() => {
        markerElement.style.transform = 'translateY(0)';
        markerElement.style.opacity = '1';
      }, 100);

      // マーカークリックイベント
      marker.getElement().addEventListener('click', () => {
        console.log('Marker clicked:', selectedEvent.お祭り名);
      });

      // カスタムポップアップの作成
      const popup = new window.geolonia.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="padding: 10px; max-width: 200px;">
          <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
            ${selectedEvent.お祭り名}
          </h3>
          <p style="margin: 0; font-size: 12px; color: #666;">
            ${selectedEvent.開催場所名}
          </p>
        </div>
      `);

      marker.setPopup(popup);

      currentMarkerRef.current = marker;

      // 地図の中心をマーカーの位置に移動
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: 12, // 15から12に変更：広域からピンが見えるように調整
        duration: 1000 // アニメーション時間
      });

      // 親コンポーネントにマーカーを通知
      onMarkerUpdate(marker);

    } catch (error) {
      console.error('Failed to create marker:', error);
    }
  }, [selectedEvent, isMapLoaded, onMarkerUpdate]);

  return (
    <div className="map-view">
      <div 
        ref={mapRef} 
        className="map-container"
        style={{ width: '100%', height: '100%', minHeight: '300px' }}
      />
      {!isMapLoaded && (
        <div className="map-loading">
          <div className="loading-spinner">地図を読み込んでいます...</div>
        </div>
      )}
    </div>
  );
};

export default MapView;
