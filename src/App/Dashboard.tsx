/** 
 * /src/App/Dashboard.tsx
 * 2025-01-25T11:10+09:00
 * 変更概要: Google Maps JavaScript API対応（MapViewコンポーネント統合）
 */

import React, { useState, useCallback } from 'react';
import EventCard from './EventCard';
import EventModal from './EventModal';
import MapView from './MapView';
import './Dashboard.scss';

interface DashboardProps {
  data: Pwamap.FestivalData[];
  onSelectShop: (shop: Pwamap.FestivalData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  onSelectShop
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Pwamap.FestivalData | null>(null);
  const [clickedEventId, setClickedEventId] = useState<string | null>(null);

  const handleEventSelect = useCallback((event: Pwamap.FestivalData) => {
    const eventId = `${event['お祭り名']}-${event['開始日']}`;
    
    if (clickedEventId === eventId) {
      // 2回目のクリック：詳細モーダルを表示
      setSelectedEvent(event);
      setClickedEventId(null); // リセット
    } else {
      // 1回目のクリック：地図上にピン表示、カードを選択状態に
      setClickedEventId(eventId);
      // MapViewコンポーネントがマーカー表示を処理
    }
    
    onSelectShop(event);
  }, [onSelectShop, clickedEventId]);

  // 直近のイベントをフィルタリング・ソート
  const upcomingEvents = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return data
      .filter(item => {
        if (!item['開始日']) return false;
        const startDate = new Date(item['開始日']);
        return startDate >= today;
      })
      .sort((item1, item2) => {
        // 1. 開始日順
        const date1 = new Date(item1['開始日']);
        const date2 = new Date(item2['開始日']);
        const dateDiff = date1.getTime() - date2.getTime();
        if (dateDiff !== 0) return dateDiff;
        
        // 2. 規模感順（大きい順）
        const scale1 = item1['規模感'] || '';
        const scale2 = item2['規模感'] || '';
        const scaleOrder = ['大', '中', '小'];
        const scaleIndex1 = scaleOrder.indexOf(scale1);
        const scaleIndex2 = scaleOrder.indexOf(scale2);
        const scaleDiff = (scaleIndex1 === -1 ? 999 : scaleIndex1) - (scaleIndex2 === -1 ? 999 : scaleIndex2);
        if (scaleDiff !== 0) return scaleDiff;
        
        // 3. 名前順
        const nameA = item1['お祭り名'] || '';
        const nameB = item2['お祭り名'] || '';
        return nameA.localeCompare(nameB, 'ja');
      });
  }, [data]);

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* イベント一覧セクション (2/3) */}
        <div className="events-section">
          <h2>直近の佐渡祭り・イベント</h2>
          <div className="events-list">
            {upcomingEvents.length === 0 ? (
              <p>直近のイベント情報はありません。</p>
            ) : (
              upcomingEvents.map((event, index) => {
                const eventId = `${event['お祭り名']}-${event['開始日']}`;
                return (
                  <div
                    key={`${event['お祭り名']}-${index}`}
                    className={`event-card-wrapper ${clickedEventId === eventId ? 'selected' : ''}`}
                    onClick={() => handleEventSelect(event)}
                  >
                    <EventCard
                      event={event}
                      isSelected={clickedEventId === eventId}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 地図セクション (1/3) */}
        <div className="map-section" onClick={() => setClickedEventId(null)}>
          <MapView 
            selectedEvent={clickedEventId ? data.find(event => 
              `${event['お祭り名']}-${event['開始日']}` === clickedEventId
            ) : null}
            onMarkerUpdate={() => {}}
          />
        </div>
      </div>

      {/* イベント詳細モーダル */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;