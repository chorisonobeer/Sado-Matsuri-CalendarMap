/** 
 * /src/App/EventModal.tsx
 * 2025-01-14T16:15+09:00
 * 変更概要: 新規追加 - イベント詳細モーダルコンポーネント（全詳細情報表示）
 */

import React, { useEffect } from 'react';
import './EventModal.scss';

interface EventModalProps {
  event: Pwamap.FestivalData;
  isOpen: boolean;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose }) => {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 背景クリックでモーダルを閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 日時フォーマット
  const formatDateTime = (dateString: string, timeString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
      return timeString ? `${dateStr} ${timeString}` : dateStr;
    } catch {
      return dateString;
    }
  };

  // 代表画像を取得
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

  // 詳細タグを取得
  const getDetailTags = () => {
    return [
      event.詳細タグ1,
      event.詳細タグ2,
      event.詳細タグ3,
      event.詳細タグ4,
      event.詳細タグ5,
      event.詳細タグ6,
      event.詳細タグ7,
      event.詳細タグ8
    ].filter(tag => tag && tag.trim() !== '');
  };

  if (!isOpen) return null;

  return (
    <div className="event-modal-backdrop" onClick={handleBackdropClick}>
      <div className="event-modal">
        <div className="modal-header">
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
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

          <div className="event-details">
            <h2 className="event-title">{event.お祭り名}</h2>
            
            <div className="detail-section">
              <h3>開催情報</h3>
              <div className="detail-item">
                <span className="label">場所:</span>
                <span className="value">{event.開催場所名}</span>
              </div>
              <div className="detail-item">
                <span className="label">開始日:</span>
                <span className="value">{formatDateTime(event.開始日)}</span>
              </div>
              {event.終了日 && event.終了日 !== event.開始日 && (
                <div className="detail-item">
                  <span className="label">終了日:</span>
                  <span className="value">{formatDateTime(event.終了日)}</span>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>詳細情報</h3>
              <div className="detail-item">
                <span className="label">料金:</span>
                <span className="value">
                  {event.無料か有料か === 'TRUE' ? '無料' : 
                   event.無料か有料か === 'FALSE' ? '有料' : 
                   event.無料か有料か || '情報なし'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">駐車場:</span>
                <span className="value">
                  {event.駐車場の有無 === 'TRUE' ? '有り' : 
                   event.駐車場の有無 === 'FALSE' ? '無し' : 
                   event.駐車場の有無 || '情報なし'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">カテゴリ:</span>
                <span className="value">{event.上位カテゴリ || '情報なし'}</span>
              </div>
              <div className="detail-item">
                <span className="label">規模:</span>
                <span className="value">{event.規模感 || '情報なし'}</span>
              </div>
              <div className="detail-item">
                <span className="label">開催状況:</span>
                <span className="value">{event.開催ステータス || '情報なし'}</span>
              </div>
            </div>

            {getDetailTags().length > 0 && (
              <div className="detail-section">
                <h3>見どころ・特徴</h3>
                <div className="tags">
                  {getDetailTags().map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {event.公式サイトURL && (
              <div className="detail-section">
                <a 
                  href={event.公式サイトURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="official-link-button"
                >
                  公式サイトを見る
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;