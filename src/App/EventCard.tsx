/** 
 * /src/App/EventCard.tsx
 * 2025-01-25T11:00+09:00
 * 変更概要: Phase 4 - 新デザイン対応（固定高さ画像、ステータスバッジ、選択状態表示）
 */

import React from 'react';
import './EventCard.scss';

interface EventCardProps {
  event: Pwamap.FestivalData;
  isSelected?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isSelected = false }) => {
  // 開催日をフォーマット（月日のみ）
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } catch {
      return dateString;
    }
  };

  // 画像URLを取得（優先順位: 画像URL1 → 画像URL2 → デフォルト）
  const getEventImage = () => {
    if (event.画像URL1) return event.画像URL1;
    if (event.画像URL2) return event.画像URL2;
    return '/hero-sado.png';
  };

  // イベントステータスを取得
  const getEventStatus = () => {
    const today = new Date();
    const startDate = new Date(event.開始日);
    const endDate = event.終了日 ? new Date(event.終了日) : startDate;

    if (today < startDate) {
      return '開催予定';
    } else if (today >= startDate && today <= endDate) {
      return '開催中';
    } else {
      return '終了';
    }
  };

  return (
    <div className={`event-card ${isSelected ? 'selected' : ''}`}>
      {/* 固定高さの画像セクション */}
      <div className="event-image">
        <img 
          src={getEventImage()} 
          alt={event.お祭り名}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/hero-sado.png';
          }}
        />
        {/* ステータスバッジ */}
        <div className="event-status">
          {getEventStatus()}
        </div>
      </div>
      
      {/* カード内容 */}
      <div className="event-content">
        <h3 className="event-title">{event.お祭り名}</h3>
        <div className="event-details">
          <div className="event-date">
            {formatDate(event.開始日)}
            {event.終了日 && event.終了日 !== event.開始日 && 
              ` - ${formatDate(event.終了日)}`
            }
          </div>
          <div className="event-location">{event.開催場所名}</div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;