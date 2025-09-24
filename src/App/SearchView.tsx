/** 
 * /src/App/SearchView.tsx
 * 2025-01-25T10:00+09:00
 * 変更概要: 新規追加 - 統合検索コンポーネント（地図/リスト切り替え、検索、フィルター機能）
 */

import React, { useState, useMemo, useCallback } from 'react';
import { FiSearch, FiMap, FiList } from 'react-icons/fi';
import MultiMapView from './MultiMapView';
import EventCard from './EventCard';
import EventModal from './EventModal';
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

  // デバッグ用ログ
  console.log('SearchView rendering with events:', events?.length || 0);
  console.log('SearchView state:', { searchQuery, selectedTags, viewMode });

  // 地域タグの定義
  const regionTags = useMemo(() => ['両津', '相川', '佐和田', '金井', '新穂', '畑野', '真野', '小木', '羽茂', '赤泊'], []);
  
  // カテゴリタグの定義
  const categoryTags = useMemo(() => ['祭り', '芸能', '文化', '自然', '体験', '食事', '宿泊'], []);

  // イベントフィルタリング
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // 検索クエリによるフィルタリング
      const matchesSearch = !searchQuery || 
        event.お祭り名?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.開催場所名?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.概要?.toLowerCase().includes(searchQuery.toLowerCase());

      // タグによるフィルタリング
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => {
        // 地域タグのチェック
        if (regionTags.includes(tag)) {
          return event.開催場所名?.includes(tag) || event.住所?.includes(tag);
        }
        // カテゴリタグのチェック
        return event.お祭り名?.includes(tag) || event.概要?.includes(tag);
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

  // モーダル閉じるハンドラー
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
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
          <h3>カテゴリ</h3>
          <div className="tag-buttons">
            {categoryTags.map(tag => (
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

      {/* メインコンテンツエリア */}
      <div className="display-area">
        {viewMode === 'map' ? (
          <div className="map-container">
            <MultiMapView
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