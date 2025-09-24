/** 
 * /src/App/Dashboard.tsx
 * 2025-01-14T10:00+09:00
 * 変更概要: 佐渡祭りカレンダー2025用ダッシュボード画面 - 未使用変数の削除とGoogle Maps型定義の修正
 */

import React, { useState, useCallback } from 'react';
import EventCard from './EventCard';
import MapView from './MapView';
import EventModal from './EventModal';
import './Dashboard.scss';

interface DashboardProps {
  data: Pwamap.FestivalData[];
  selectedShop?: Pwamap.FestivalData;
  onSelectShop: (shop: Pwamap.FestivalData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  data,
  selectedShop,
  onSelectShop
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Pwamap.FestivalData | null>(null);

  const handleEventSelect = useCallback((event: Pwamap.FestivalData) => {
    setSelectedEvent(event);
    onSelectShop(event);
  }, [onSelectShop]);

  const handleMarkerUpdate = useCallback((_marker: google.maps.Marker | null) => {
    // マーカー更新処理（必要に応じて実装）
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="events-section">
          <h2>佐渡の祭り・イベント</h2>
          <div className="events-list">
            {data.map((event, index) => (
              <EventCard
                key={`${event['お祭り名']}-${index}`}
                event={event}
                isSelected={selectedShop?.['お祭り名'] === event['お祭り名']}
                onClick={handleEventSelect}
              />
            ))}
          </div>
        </div>
        
        <div className="map-section">
          <MapView
            events={data}
            selectedEvent={selectedShop}
            onEventSelect={handleEventSelect}
            onMarkerUpdate={handleMarkerUpdate}
          />
        </div>
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Dashboard;