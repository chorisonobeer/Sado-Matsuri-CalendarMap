import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './HybridView.scss'; // 新しいSCSSファイル
import { MapPointBase } from './Map'; // Mapコンポーネントの型定義を再利用
import SearchFeature from './SearchFeature'; // 既存のSearchFeatureを再利用

// Google Maps APIキーは環境変数から取得
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

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
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  // const currentMarkerRef = useRef<google.maps.Marker | null>(null); // 未使用のためコメントアウト
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

  // Google Maps APIの読み込み
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      if (!GOOGLE_MAPS_API_KEY) {
        console.error('Google Maps API key is not set');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
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
      center: { lat: 38.0195, lng: 138.2570 }, // 佐渡島中心
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

  // マーカーの表示・更新
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // 既存のマーカーをすべて削除
    const markers: google.maps.Marker[] = []; // ローカル変数として定義
    markers.forEach(marker => marker.setMap(null));
    markers.length = 0; // 配列をクリア

    filteredEvents.forEach(event => {
      if (event.緯度 && event.経度) {
        const lat = parseFloat(event.緯度);
        const lng = parseFloat(event.経度);

        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: mapInstanceRef.current,
            animation: google.maps.Animation.DROP,
            title: event.お祭り名
          });

          marker.addListener('click', () => {
            onSelectShop(event); // イベント詳細表示
          });
          markers.push(marker);
        }
      } 
    });
  }, [filteredEvents, isMapLoaded, onSelectShop]);

  // フィルタリング結果の更新
  const handleFilterResults = useCallback((results: Pwamap.FestivalData[]) => {
    setFilteredEvents(results);
    onSearchResults(results); // App.tsxにも結果を伝える
  }, [onSearchResults]);

  return (
    <div className="hybrid-view">
      <SearchFeature
        data={data}
        onSearchResults={handleFilterResults}
        onSelectShop={onSelectShop}
      />

      <div className="view-tabs">
        <button
          className={`view-tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => navigate('/map')}
        >
          地図
        </button>
        <button
          className={`view-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => navigate('/list')}
        >
          リスト
        </button>
      </div>

      <div className="view-content">
        {activeTab === 'map' && (
          <div
            ref={mapRef}
            className="map-container"
            style={{ width: '100%', height: '100%' }}
          />
        )}
        {activeTab === 'list' && (
          <div className="list-container">
            {filteredEvents.length === 0 ? (
              <div className="no-results">該当するイベントがありません</div>
            ) : (
              <div className="event-list">
                {filteredEvents.map((event, _index) => (
                  <div key={event.index} className="event-card" onClick={() => onSelectShop(event)}>
                    {/* EventCardの内容をここに記述、または既存のEventCardコンポーネントを再利用 */}
                    <h3>{event.お祭り名}</h3>
                    <p>{event.開催場所名}</p>
                    <p>{event.開始日}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HybridView;
