/** 
 * /src/App/SearchView.tsx
 * 2025-01-25T10:00+09:00
 * 変更概要: 新規追加 - 統合検索コンポーネント（地図/リスト切り替え、検索、フィルター機能）
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { FiSearch, FiMap, FiList } from 'react-icons/fi';
import MultiMapView from './MultiMapView';
import EventCard from './EventCard';
import EventModal from './EventModal';
import LocationButton from '../components/LocationButton';
import './SearchView.scss';

interface SearchViewProps {
  events: Pwamap.FestivalData[];
}

const SearchView: React.FC<SearchViewProps> = ({ events }) => {
  // 状態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [selectedEvent, setSelectedEvent] = useState<Pwamap.FestivalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mapViewRef = useRef<{ moveToLocation: (location: [number, number]) => void } | null>(null);

  // デバッグ用ログ
  console.log('SearchView rendering with events:', events?.length || 0);
  console.log('SearchView state:', { searchQuery, selectedTags, viewMode });

  // 地域タグの定義
  const regionTags = useMemo(() => ['両津', '相川', '佐和田', '金井', '新穂', '畑野', '真野', '小木', '羽茂', '赤泊'], []);
  
  // タグの定義（カテゴリから変更）
  const tags = useMemo(() => ['開催中', '鬼太鼓', '無料', '祭り', '芸能', '文化', '自然', '体験', '食事', '宿泊'], []);

  // 全項目での全文検索関数
  const searchInAllFields = (event: Pwamap.FestivalData, query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    const fieldsToSearch = [
      event.お祭り名,
      event.簡単な説明,
      event.開催場所名,
      event.住所,
      event.上位カテゴリ,
      event.詳細タグ,
      event.見どころ,
      event.アクセス方法,
      event.開催ステータス,
      // 日付や時刻も検索対象に含める
      event.開始日,
      event.終了日,
      event.開始時刻,
      event.終了時刻
    ];

    return fieldsToSearch.some(field => 
      field && field.toString().toLowerCase().includes(lowerQuery)
    );
  };

  // イベントフィルタリング
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // 検索クエリによる全項目全文検索
      const matchesSearch = !searchQuery || searchInAllFields(event, searchQuery);

      // タグによるフィルタリング
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => {
        // 地域タグのチェック
        if (regionTags.includes(tag)) {
          return event.開催場所名?.includes(tag) || event.住所?.includes(tag);
        }
        
        // 特別なタグのチェック
        if (tag === '開催中') {
          return event.開催ステータス?.includes('開催中') || event.開催ステータス?.includes('実施中');
        }
        
        if (tag === '鬼太鼓') {
          return event.お祭り名?.includes('鬼太鼓') || 
                 event.詳細タグ?.includes('鬼太鼓') || 
                 event.見どころ?.includes('鬼太鼓');
        }
        
        if (tag === '無料') {
          return event.無料か有料か === 'TRUE' || event.無料か有料か?.includes('無料');
        }
        
        // その他のタグのチェック（全項目で検索）
        return searchInAllFields(event, tag);
      });

      return matchesSearch && matchesTags;
    });
  }, [events, searchQuery, selectedTags, regionTags]);

  // タグ選択ハンドラー
  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  // イベント選択ハンドラー
  const handleEventSelect = useCallback((event: Pwamap.FestivalData) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

   // モーダルを閉じる
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  // 現在地移動ハンドラー
  const handleLocationFound = useCallback((location: [number, number]) => {
    if (mapViewRef.current && mapViewRef.current.moveToLocation) {
      mapViewRef.current.moveToLocation(location);
    }
  }, []);

  return (
    <div className="search-view">
      {console.log('SearchView JSX rendering started')}
      {/* 検索ボックス */}
      <div className="search-box">
        {console.log('Rendering search-box')}
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="イベント名、場所で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* タグフィルター */}
      <div className="tag-filter">
        <div className="tag-section">
          <h3>地域</h3>
          <div className="tag-buttons">
            {regionTags.map(tag => (
              <button
                key={tag}
                className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="tag-section">
          <h3>タグ</h3>
          <div className="tag-buttons">
            {tags.map(tag => (
              <button
                key={tag}
                className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 表示切り替えタブ */}
      <div className="view-toggle">
        <div className="toggle-buttons">
          <button
            className={`toggle-button ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <FiMap className="toggle-icon" />
            地図
          </button>
          <button
            className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FiList className="toggle-icon" />
            リスト
          </button>
        </div>
        {viewMode === 'map' && (
          <LocationButton 
            onLocationFound={handleLocationFound}
            className="search-control"
          />
        )}
      </div>

      {/* メインコンテンツエリア */}
      <div className="display-area">
        {viewMode === 'map' ? (
          <div className="map-container">
            <MultiMapView
              ref={mapViewRef}
              events={filteredEvents}
              selectedEvent={selectedEvent}
              onEventSelect={handleEventSelect}
            />
          </div>
        ) : (
          <div className="list-container">
            {filteredEvents.length > 0 ? (
              <div className="event-grid">
                {filteredEvents.map((event, index) => (
                  <div
                    key={`${event.お祭り名}-${index}`}
                    onClick={() => handleEventSelect(event)}
                    className="event-card-wrapper"
                  >
                    <EventCard
                      event={event}
                      isSelected={selectedEvent?.お祭り名 === event.お祭り名}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>検索条件に一致するイベントが見つかりませんでした。</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* イベント詳細モーダル */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SearchView;