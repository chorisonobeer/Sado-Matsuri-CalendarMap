/** 
 * /src/App/Dashboard.tsx
 * 2025-01-14T10:00+09:00
 * 変更概要: 佐渡祭りカレンダー2025用ダッシュボード画面 - 未使用変数の削除とGoogle Maps型定義の修正
 */

import React, { useState, useCallback } from 'react';
import EventCard from './EventCard';
import EventModal from './EventModal';
import './Dashboard.scss';

interface DashboardProps {
  data: Pwamap.FestivalData[];
  selectedShop: Pwamap.FestivalData | undefined;
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

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // 直近のイベントをフィルタリング・ソート
  const upcomingEvents = React.useMemo(() => {
    const now = new Date();
    return data
      .filter(event => {
        const eventDate = Date.parse(event['開始日'] || '');
        return eventDate && eventDate >= now.getTime();
      })
      .sort((item1, item2) => {
        // 1. 開始日優先 (昇順)
        const dateA = Date.parse(item1['開始日'] || '');
        const dateB = Date.parse(item2['開始日'] || '');
        if (dateA && dateB && dateA !== dateB) {
          return dateA - dateB;
        }
        // 2. お祭り名のあいうえお順 (昇順)
        const nameA = item1['お祭り名'] || '';
        const nameB = item2['お祭り名'] || '';
        return nameA.localeCompare(nameB, 'ja');
      });
  }, [data]);

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="events-section">
          <h2>直近の佐渡祭り・イベント</h2>
          <div className="events-list">
            {upcomingEvents.length === 0 ? (
              <p>直近のイベント情報はありません。</p>
            ) : (
              upcomingEvents.map((event, index) => (
                <EventCard
                  key={`${event['お祭り名']}-${index}`}
                  event={event}
                  isSelected={selectedShop?.['お祭り名'] === event['お祭り名']}
                  onClick={handleEventSelect}
                />
              ))
            )}
          </div>
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