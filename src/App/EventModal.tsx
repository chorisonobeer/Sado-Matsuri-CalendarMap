/** 
 * /src/App/EventModal.tsx
 * 2025-01-14T16:15+09:00
 * 変更概要: 新規追加 - イベント詳細モーダルコンポーネント（全詳細情報表示）
 */

import React, { useEffect, useState } from 'react';
import './EventModal.scss';

interface EventModalProps {
  event: Pwamap.FestivalData;
  isOpen: boolean;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    } catch {
      return dateString;
    }
  };

  // 日時表示フォーマット（開始日/時刻-終了時刻、終了日/時刻の形式）
  const formatEventDateTime = () => {
    const startDate = formatDateTime(event.開始日);
    const endDate = event.終了日 ? formatDateTime(event.終了日) : '';
    const startTime = event.開始時刻 || '';
    const endTime = event.終了時刻 || '';

    let result = '';
    if (startDate) {
      result += startDate;
      if (startTime && endTime) {
        result += ` / ${startTime} - ${endTime}`;
      } else if (startTime) {
        result += ` / ${startTime}`;
      }
    }

    if (endDate && endDate !== startDate) {
      result += '\n' + endDate;
      if (startTime && endTime) {
        result += ` / ${startTime} - ${endTime}`;
      } else if (startTime) {
        result += ` / ${startTime}`;
      }
    }

    return result || '日時未定';
  };

  // 全画像を取得
  const getEventImages = () => {
    const imageUrls = [
      event.写真URL1,
      event.写真URL2,
      event.写真URL3,
      event.写真URL4,
      event.写真URL5
    ].filter(url => url && url.trim() !== '');

    return imageUrls.length > 0 ? imageUrls : ['/hero-sado.png'];
  };

  const eventImages = getEventImages();

  // GoogleMapアプリでルート案内を開く
  const openGoogleMapsRoute = () => {
    const lat = parseFloat(event.緯度);
    const lng = parseFloat(event.経度);
    
    let url = '';
    
    if (!isNaN(lat) && !isNaN(lng)) {
      // 座標が有効な場合は座標を使用
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    } else if (event.住所) {
      // 座標が無効な場合は住所を使用
      const encodedAddress = encodeURIComponent(event.住所);
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
    } else {
      alert('位置情報が取得できませんでした');
      return;
    }
    
    // 外部アプリ（GoogleMap）を起動
    window.open(url, '_blank');
  };

  // 画像切り替え
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % eventImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + eventImages.length) % eventImages.length);
  };

  // モーダルが開かれた時に画像インデックスをリセット
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen]);

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
          <div className="event-image-container">
            <div className="event-image">
              <img 
                src={eventImages[currentImageIndex]} 
                alt={`${event.お祭り名} - 画像${currentImageIndex + 1}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/hero-sado.png';
                }}
              />
              {eventImages.length > 1 && (
                <>
                  <button className="image-nav prev" onClick={prevImage}>‹</button>
                  <button className="image-nav next" onClick={nextImage}>›</button>
                  <div className="image-indicators">
                    {eventImages.map((_, index) => (
                      <span 
                        key={index} 
                        className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="event-details">
            <h2 className="event-title">{event.お祭り名}</h2>
            
            {event.簡単な説明 && (
              <div className="event-description">
                {event.簡単な説明}
              </div>
            )}

            <div className="detail-section">
              <h3>開催情報</h3>
              <div className="detail-item">
                <span className="label">日時:</span>
                <span className="value" style={{ whiteSpace: 'pre-line' }}>{formatEventDateTime()}</span>
              </div>
              <div className="detail-item">
                <span className="label">場所:</span>
                <span className="value">{event.開催場所名 || '情報なし'}</span>
              </div>
              {event.住所 && (
                <div className="detail-item">
                  <span className="label">住所:</span>
                  <span 
                    className="value address-link" 
                    onClick={() => openGoogleMapsRoute()}
                    style={{ 
                      color: '#1976d2', 
                      textDecoration: 'underline', 
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {event.住所}
                    <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                      (タップでルート案内)
                    </span>
                  </span>
                </div>
              )}
              <div className="detail-item">
                <span className="label">開催状況:</span>
                <span className="value">{event.開催ステータス || '情報なし'}</span>
              </div>
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
                <span className="label">飲食店出店:</span>
                <span className="value">
                  {event.飲食店出店の有無 === 'TRUE' ? '有り' : 
                   event.飲食店出店の有無 === 'FALSE' ? '無し' : 
                   event.飲食店出店の有無 || '情報なし'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">カテゴリ:</span>
                <span className="value">{event.上位カテゴリ || '情報なし'}</span>
              </div>
            </div>

            {getDetailTags().length > 0 && (
              <div className="detail-section">
                <h3>詳細タグ</h3>
                <div className="tags">
                  {getDetailTags().map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {event.見どころ && (
              <div className="detail-section">
                <h3>見どころ</h3>
                <div className="detail-text">{event.見どころ}</div>
              </div>
            )}

            {event.アクセス方法 && (
              <div className="detail-section">
                <h3>アクセス方法</h3>
                <div className="detail-text">{event.アクセス方法}</div>
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