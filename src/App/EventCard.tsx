/** 
 * /src/App/EventCard.tsx
 * 2025-01-14T16:05+09:00
 * 変更概要: 新規追加 - イベントカードコンポーネント（画像、名前、日付、場所表示）
 */

import React from 'react';
import './EventCard.scss';

interface EventCardProps {
  event: Pwamap.FestivalData;
  onClick: (event: Pwamap.FestivalData) => void;
  isSelected: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick, isSelected }) => {
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

  // 代表画像を取得（写真URL1-5から最初に有効なものを選択）
  const getEventImage = () => {
    const imageUrls = [
      event.写真URL1,
      event.写真URL2,
      event.写真URL3,
      event.写真URL4,
      event.写真URL5
    ].filter(url => url && url.trim() !== '');

    return imageUrls.length > 0 ? imageUrls[0] : '/hero-sado.png';
  };

  return (
    <div 
      className={`event-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(event)}
    >
      <div className="event-image">
        <img 
          src={getEventImage()} 
          alt={event.お祭り名}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/hero-sado.png';
          }}
        />
      </div>
      
      <div className="event-info">
        <h3 className="event-name">{event.お祭り名}</h3>
        <div className="event-date">
          {formatDate(event.開始日)}
          {event.終了日&& event.終了日!== event.開始日 && 
            ` - ${formatDate(event.終了日)}`
          }
        </div>
        <div className="event-location">{event.開催場所名}</div>
      </div>
    </div>
  );
};

export default EventCard;