/**
 * /src/App/HybridView.tsx
 * 2025-01-25T19:30+09:00
 * 変更概要: Google MapsからGeolonia Mapsに移行 - ハイブリッド地図表示コンポーネント
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './HybridView.scss';
import { MapPointBase } from './Map';
import SearchFeature from './SearchFeature';

interface HybridViewProps {
  data: Pwamap.FestivalData[];
  onSelectShop: (shop: MapPointBase | undefined) => void;
  onSearchResults: (results: Pwamap.FestivalData[]) => void;
}

const HybridView: React.FC<HybridViewProps> = ({ data, onSelectShop, onSearchResults }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'map' | 'list'>(location.pathname === '/list' ? 'list' : 'map');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // geolonia.Map
  const markersRef = useRef<any[]>([]); // geolonia.Marker[]
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<Pwamap.FestivalData[]>(data);

  // URLパスに基づいてアクティブタブを更新
  useEffect(() => {
    if (location.pathname === '/list') {
      setActiveTab('list');
    } else if (location.pathname === '/map') {
      setActiveTab('map');
    }
  }, [location.pathname]);

  // 地図の初期化
  const initializeMap = () => {
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
        console.log('HybridView: Geolonia map loaded successfully');
        setIsMapLoaded(true);
        updateMarkers(); // 地図読み込み後にマーカーを表示
      });

      // エラーハンドリング
      mapInstanceRef.current.on('error', (e: any) => {
        console.error('HybridView: Geolonia map error:', e);
      });

    } catch (error) {
      console.error('Failed to initialize Geolonia map:', error);
    }
  };

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

    // クリーンアップ
    return () => {
      // 全てのマーカーを削除
      markersRef.current.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
      markersRef.current = [];
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // マーカーを更新する関数
  const updateMarkers = () => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    // 既存のマーカーを削除
    markersRef.current.forEach(marker => {
      if (marker && marker.remove) {
        marker.remove();
      }
    });
    markersRef.current = [];

    // 有効な座標を持つイベントのみフィルタリング
    const validEvents = filteredEvents.filter(event => {
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
      const lat = parseFloat(event.緯度);
      const lng = parseFloat(event.経度);

      try {
        const marker = new window.geolonia.Marker({
          color: '#0066CC',
          scale: 1.0
        })
          .setLngLat([lng, lat])
          .addTo(mapInstanceRef.current);

        // マーカークリックイベント
        marker.getElement().addEventListener('click', () => {
          console.log('Marker clicked:', event.お祭り名);
          
          // onSelectShopを呼び出し（MapPointBase形式に変換）
          const mapPoint: MapPointBase = {
            index: 0, // 仮のindex値
            緯度: event.緯度,
            経度: event.経度,
            お祭り名: event.お祭り名,
            住所: event.住所 || '',
            簡単な説明: event.簡単な説明 || ''
          };
          onSelectShop(mapPoint);
        });

        // ポップアップの作成
        const popup = new window.geolonia.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false
        }).setHTML(`
          <div style="padding: 12px; max-width: 280px;">
            <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: bold; color: #333;">
              ${event.お祭り名}
            </h3>
            <div style="font-size: 12px; color: #666; margin-bottom: 6px;">
              <strong>場所:</strong> ${event.開催場所名 || '未設定'}
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 6px;">
              <strong>住所:</strong> ${event.住所 || '未設定'}
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 6px;">
              <strong>日時:</strong> ${event.開始日 || '未設定'}
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 6px;">
              <strong>料金:</strong> ${event.無料か有料か === 'TRUE' ? '無料' : '有料'}
            </div>
            ${event.簡単な説明 ? `
              <div style="font-size: 11px; color: #888; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                ${event.簡単な説明}
              </div>
            ` : ''}
          </div>
        `);

        marker.setPopup(popup);
        markersRef.current.push(marker);

      } catch (error) {
        console.error('Failed to create marker for event:', event.お祭り名, error);
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

      // 境界に余裕を持たせて表示
      mapInstanceRef.current.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 15
      });
    }
  };

  // フィルタされたイベントが変更された時にマーカーを更新
  useEffect(() => {
    if (isMapLoaded) {
      updateMarkers();
    }
  }, [filteredEvents, isMapLoaded]);

  // データが変更された時にフィルタされたイベントを更新
  useEffect(() => {
    setFilteredEvents(data);
  }, [data]);

  // タブ切り替えハンドラー
  const handleTabChange = (tab: 'map' | 'list') => {
    setActiveTab(tab);
    navigate(tab === 'list' ? '/list' : '/map');
  };

  // 検索結果ハンドラー
  const handleSearchResults = (results: Pwamap.FestivalData[]) => {
    setFilteredEvents(results);
    onSearchResults(results);
  };

  return (
    <div className="hybrid-view">
      {/* 検索機能 */}
      <div className="search-section">
        <SearchFeature 
          data={data} 
          onSearchResults={handleSearchResults}
          onSelectShop={(event) => {
            const lat = parseFloat(event.緯度);
            const lng = parseFloat(event.経度);
            if (!isNaN(lat) && !isNaN(lng)) {
              const mapPoint: MapPointBase = {
                index: 0,
                緯度: event.緯度,
                経度: event.経度,
                お祭り名: event.お祭り名,
                住所: event.住所 || '',
                簡単な説明: event.簡単な説明 || ''
              };
              onSelectShop(mapPoint);
            }
          }}
        />
      </div>

      {/* タブ切り替え */}
      <div className="tab-switcher">
        <button 
          className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => handleTabChange('map')}
        >
          <span className="tab-icon">🗺️</span>
          地図
        </button>
        <button 
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => handleTabChange('list')}
        >
          <span className="tab-icon">📋</span>
          リスト
        </button>
      </div>

      {/* コンテンツエリア */}
      <div className="content-area">
        {activeTab === 'map' && (
          <div className="map-section">
            <div 
              ref={mapRef} 
              className="map-container"
              style={{ width: '100%', height: '100%', minHeight: '500px' }}
            />
            {!isMapLoaded && (
              <div className="map-loading">
                <div className="loading-spinner">地図を読み込んでいます...</div>
              </div>
            )}
            {isMapLoaded && filteredEvents.length === 0 && (
              <div className="no-events-overlay">
                <div className="no-events-message">
                  検索条件に一致するイベントがありません
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="list-section">
            {filteredEvents.length > 0 ? (
              <div className="event-list">
                {filteredEvents.map((event, index) => (
                  <div 
                    key={`${event.お祭り名}-${index}`} 
                    className="event-item"
                    onClick={() => {
                      const lat = parseFloat(event.緯度);
                      const lng = parseFloat(event.経度);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        const mapPoint: MapPointBase = {
                          index: 0, // 仮のindex値
                          緯度: event.緯度,
                          経度: event.経度,
                          お祭り名: event.お祭り名,
                          住所: event.住所 || '',
                          簡単な説明: event.簡単な説明 || ''
                        };
                        onSelectShop(mapPoint);
                        handleTabChange('map'); // 地図タブに切り替え
                      }
                    }}
                  >
                    <h3 className="event-name">{event.お祭り名}</h3>
                    <div className="event-details">
                      <div className="event-location">📍 {event.開催場所名}</div>
                      <div className="event-date">📅 {event.開始日}</div>
                      <div className="event-price">
                        💰 {event.無料か有料か === 'TRUE' ? '無料' : '有料'}
                      </div>
                    </div>
                    {event.簡単な説明 && (
                      <div className="event-description">{event.簡単な説明}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-events-message">
                検索条件に一致するイベントがありません
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HybridView;
