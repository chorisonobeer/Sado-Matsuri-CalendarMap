/**
 * /src/App/MultiMapView.tsx
 * 2025-01-25T19:30+09:00
 * 変更概要: Google MapsからGeolonia Mapsに移行 - 複数イベント対応地図表示コンポーネント（検索画面用）
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
  const mapInstanceRef = useRef<any>(null); // geolonia.Map
  const markersRef = useRef<Map<string, any>>(new Map()); // geolonia.Marker
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 地図の初期化
  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Geolonia APIが利用可能かチェック
    if (!window.geolonia) {
      console.error('Geolonia API is not loaded');
      return;
    }

    try {
      // 佐渡島の中心座標
      const defaultCenter: [number, number] = [138.2570, 38.0195]; // [lng, lat]
      const defaultZoom = parseInt(process.env.REACT_APP_ZOOM || '10');

      // Geolonia地図の初期化
      mapInstanceRef.current = new window.geolonia.Map({
        container: mapRef.current,
        style: 'geolonia/basic',
        center: defaultCenter,
        zoom: defaultZoom,
        attributionControl: true
      });

      // 地図読み込み完了イベント
      mapInstanceRef.current.on('load', () => {
        console.log('MultiMapView: Geolonia map loaded successfully');
        setIsMapLoaded(true);
      });

      // エラーハンドリング
      mapInstanceRef.current.on('error', (e: any) => {
        console.error('MultiMapView: Geolonia map error:', e);
      });

    } catch (error) {
      console.error('Failed to initialize Geolonia map:', error);
    }
  }, []);

  // Geolonia Maps APIの読み込み確認と地図初期化
  useEffect(() => {
    const checkGeoloniaAPI = () => {
      if (window.geolonia) {
        initializeMap();
      } else {
        // APIが読み込まれるまで待機
        setTimeout(checkGeoloniaAPI, 100);
      }
    };

    checkGeoloniaAPI();

    // クリーンアップ - ESLintエラーを回避するため、エフェクト実行時にrefを保存
    const currentMarkersRef = markersRef.current;
    const currentMapInstance = mapInstanceRef.current;
    
    return () => {
      // 全てのマーカーを削除
      currentMarkersRef.forEach(marker => {
        marker.remove();
      });
      currentMarkersRef.clear();
      
      if (currentMapInstance) {
        currentMapInstance.remove();
      }
    };
  }, [initializeMap]);

  // マーカーを作成する関数
  const createMarker = useCallback((event: Pwamap.FestivalData, isSelected: boolean = false) => {
    const lat = parseFloat(event.緯度);
    const lng = parseFloat(event.経度);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates for event:', event.お祭り名);
      return null;
    }

    try {
      // マーカーの色を選択状態に応じて変更
      const markerColor = isSelected ? '#FF0000' : '#0066CC';
      const markerScale = isSelected ? 1.3 : 1.0;

      const marker = new window.geolonia.Marker({
        color: markerColor,
        scale: markerScale
      })
        .setLngLat([lng, lat])
        .addTo(mapInstanceRef.current);

      // マーカークリックイベント
      marker.getElement().addEventListener('click', () => {
        console.log('Marker clicked:', event.お祭り名);
        onEventSelect(event);
      });

      // ポップアップの作成
      const popup = new window.geolonia.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #333;">
            ${event.お祭り名}
          </h3>
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
            <strong>場所:</strong> ${event.開催場所名 || '未設定'}
          </div>
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
            <strong>日時:</strong> ${event.開始日 || '未設定'}
          </div>
          <div style="font-size: 12px; color: #666;">
            <strong>料金:</strong> ${event.無料か有料か === 'TRUE' ? '無料' : '有料'}
          </div>
        </div>
      `);

      marker.setPopup(popup);

      return marker;
    } catch (error) {
      console.error('Failed to create marker for event:', event.お祭り名, error);
      return null;
    }
  }, [onEventSelect]);

  // イベントリストに基づいてマーカーを更新
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !events.length) return;

    // 既存のマーカーをクリア
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current.clear();

    // 有効な座標を持つイベントのみフィルタリング
    const validEvents = events.filter(event => {
      const lat = parseFloat(event.緯度);
      const lng = parseFloat(event.経度);
      return !isNaN(lat) && !isNaN(lng);
    });

    if (validEvents.length === 0) {
      console.warn('No events with valid coordinates found');
      return;
    }

    // 各イベントにマーカーを作成
    validEvents.forEach(event => {
      const isSelected = !!(selectedEvent && selectedEvent.お祭り名 === event.お祭り名);
      const marker = createMarker(event, isSelected);
      
      if (marker) {
        markersRef.current.set(event.お祭り名, marker);
      }
    });

    // 地図の表示範囲を全マーカーが見えるように調整
    if (validEvents.length > 1) {
      const bounds = new window.geolonia.LngLatBounds();
      
      validEvents.forEach(event => {
        const lat = parseFloat(event.緯度);
        const lng = parseFloat(event.経度);
        bounds.extend([lng, lat]);
      });

      // 境界に少し余裕を持たせて表示
      mapInstanceRef.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15
      });
    } else if (validEvents.length === 1) {
      // 単一イベントの場合は中心に表示
      const event = validEvents[0];
      const lat = parseFloat(event.緯度);
      const lng = parseFloat(event.経度);
      
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        duration: 1000
      });
    }

  }, [events, selectedEvent, isMapLoaded, createMarker]);

  // 選択されたイベントのマーカーを強調表示
  useEffect(() => {
    if (!isMapLoaded || !selectedEvent) return;

    // 全てのマーカーを通常状態に戻す
    markersRef.current.forEach((_, eventName) => {
      const isSelected = eventName === selectedEvent.お祭り名;
      
      // マーカーの色とサイズを更新（Geoloniaでは直接変更が困難なため、再作成）
      if (isSelected) {
        // 選択されたマーカーの位置に地図を移動
        const lat = parseFloat(selectedEvent.緯度);
        const lng = parseFloat(selectedEvent.経度);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          mapInstanceRef.current.flyTo({
            center: [lng, lat],
            zoom: 15,
            duration: 1000
          });
        }
      }
    });
  }, [selectedEvent, isMapLoaded]);

  return (
    <div className="multi-map-view">
      <div 
        ref={mapRef} 
        className="map-container"
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      />
      {!isMapLoaded && (
        <div className="map-loading">
          <div className="loading-spinner">地図を読み込んでいます...</div>
        </div>
      )}
      {isMapLoaded && events.length === 0 && (
        <div className="no-events-overlay">
          <div className="no-events-message">
            表示するイベントがありません
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiMapView;
