/** 
 * /src/App/Events.tsx
 * 2025-05-02T10:00+09:00
 * 変更概要: イベント情報のsessionStorageキャッシュ機構を追加
 */

import React, { useEffect, useState } from "react";
import * as Papa from "papaparse";
import config from "../config.json";
import LoadingSpinner from "./LoadingSpinner";
import "./Events.scss";
import { parseCsvByHeader, stripWrappingQuotes } from "../lib/csv";

type EventData = Pwamap.EventData;

const Events: React.FC = () => {
  // sessionStorageキャッシュを同期的にチェックして初期状態を設定
  const getCachedData = () => {
    try {
      const cached = sessionStorage.getItem("eventListCache");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  };

  const [eventList, setEventList] = useState<EventData[]>(() => getCachedData());
  const [selectedEvent, setSelectedEvent] = useState<EventData | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(() => {
    // キャッシュがある場合は初期ローディングをスキップ
    const cached = sessionStorage.getItem("eventListCache");
    return !cached;
  });
  const [error, setError] = useState<string | null>(null);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  useEffect(() => {
    // sessionStorageキャッシュ確認
    const cacheKey = "eventListCache";
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // キャッシュがある場合はローディング状態を即座に解除
        if (loading) {
          setLoading(false);
        }
        // バックグラウンドで最新データ取得
        fetch(config.event_data_url)
          .then((response) => {
            if (!response.ok) throw new Error("イベントデータの取得に失敗しました");
            return response.text();
          })
          .then((csv) => {
            Papa.parse(csv, {
              header: true,
              complete: (results) => {
                const features = results.data as EventData[];
                const nextEventList: EventData[] = [];
                const urlKeys: (keyof EventData)[] = ["公式サイト", "公式リンク", "Instagram", "Facebook", "X"];
                for (let i = 0; i < features.length; i++) {
                  const feature = { ...features[i] };
                  // 新しいフィールド名と旧フィールド名の両方をチェック
                  if (!feature["イベント名"]) continue;
                  
                  // 開催期間の互換性処理
                  if (!feature["開催期間"] && feature["開始日"]) {
                    feature["開催期間"] = `${feature["開始日"]}～${feature["終了日"] || feature["開始日"]}`;
                  }
                  
                  // 場所の互換性処理
                  if (!feature["場所"] && feature["会場名"]) {
                    feature["場所"] = feature["会場名"] + (feature["住所"] ? `（${feature["住所"]}）` : '');
                  }
                  
                  // 説明文の互換性処理
                  if (!feature["説明文"] && feature["簡単な説明"]) {
                    feature["説明文"] = feature["簡単な説明"];
                  }
                  
                  // タグの互換性処理
                  if (!feature["タグ"] && feature["詳細タグ"]) {
                    feature["タグ"] = feature["詳細タグ"];
                  }
                  
                  // 公式サイトの互換性処理
                  if (!feature["公式サイト"] && feature["公式リンク"]) {
                    feature["公式サイト"] = feature["公式リンク"];
                  }
                  
                  // 画像URLの互換性処理
                  if (!feature["画像URL1"] && feature["写真URL"]) {
                    feature["画像URL1"] = feature["写真URL"];
                  }
                  
                  urlKeys.forEach(key => {
                    let value = feature[key] as string | undefined;
                    if (value && typeof value === 'string') {
                      value = value.trim();
                      if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.substring(1, value.length - 1);
                      }
                      if (value.startsWith("'") && value.endsWith("'")) {
                        value = value.substring(1, value.length - 1);
                      }
                      if (value.startsWith('`') && value.endsWith('`')) {
                        value = value.substring(1, value.length - 1);
                      }
                      (feature[key] as string) = value.trim();
                    }
                  });
                  const event = { index: i, ...feature };
                  nextEventList.push(event);
                }
                // 差分があればキャッシュ・state更新
                if (JSON.stringify(parsed) !== JSON.stringify(nextEventList)) {
                  setEventList(nextEventList);
                  sessionStorage.setItem(cacheKey, JSON.stringify(nextEventList));
                }
              },
              error: () => {},
            });
          })
          .catch(() => {});
        return;
      } catch (e) {
        // パース失敗時は通常フロー
      }
    }
    // キャッシュなし時は通常取得（loadingは既にtrueに設定済み）
    fetch(config.event_data_url)
      .then((response) => {
        if (!response.ok) throw new Error("イベントデータの取得に失敗しました");
        return response.text();
      })
      .then((csv) => {
        const features = parseCsvByHeader<EventData>(csv, {
          requiredFields: ["イベント名"],
          transform: (record, i) => {
            const feature = { ...(record as any) } as EventData;
            // 開催期間の互換性処理
            if (!feature["開催期間"] && (feature as any)["開始日"]) {
              (feature as any)["開催期間"] = `${(feature as any)["開始日"]}～${(feature as any)["終了日"] || (feature as any)["開始日"]}`;
            }
            // 場所の互換性処理
            if (!feature["場所"] && (feature as any)["会場名"]) {
              (feature as any)["場所"] = (feature as any)["会場名"] + ((feature as any)["住所"] ? `（${(feature as any)["住所"]}）` : '');
            }
            // 説明文の互換性処理
            if (!feature["説明文"] && (feature as any)["簡単な説明"]) {
              (feature as any)["説明文"] = (feature as any)["簡単な説明"];
            }
            // タグの互換性処理
            if (!feature["タグ"] && (feature as any)["詳細タグ"]) {
              (feature as any)["タグ"] = (feature as any)["詳細タグ"];
            }
            // 公式サイトの互換性処理
            if (!feature["公式サイト"] && (feature as any)["公式リンク"]) {
              (feature as any)["公式サイト"] = (feature as any)["公式リンク"];
            }
            // 画像URLの互換性処理
            if (!(feature as any)["画像URL1"] && (feature as any)["写真URL"]) {
              (feature as any)["画像URL1"] = (feature as any)["写真URL"];
            }
            // URL系の引用符除去
            const urlKeys: (keyof EventData)[] = ["公式サイト", "公式リンク", "Instagram", "Facebook", "X"];
            urlKeys.forEach((key) => {
              const v = (feature as any)[key];
              if (typeof v === 'string') (feature as any)[key] = stripWrappingQuotes(v);
            });
            return { index: i, ...feature } as EventData;
          }
        });
        setEventList(features);
        sessionStorage.setItem(cacheKey, JSON.stringify(features));
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loading]);

  const showEventDetail = (event: EventData) => {
    setSelectedEvent(event);
  };

  const closeDetail = () => {
    setSelectedEvent(undefined);
  };

  if (loading) return <LoadingSpinner variant="circular" size="md" text="イベント情報を読み込み中..." />;
  if (error) return <div className="events-error">{error}</div>;

  // 開催期間から日付を抽出・クレンジングする関数
  const extractDate = (dateString: string): Date => {
    if (!dateString) return new Date(0); // 無効な日付は最古として扱う
    
    // 年月日の数字を抽出する正規表現
    const yearMatch = dateString.match(/(\d{4})年?/);
    const monthMatch = dateString.match(/年?(\d{1,2})月/);
    const dayMatch = dateString.match(/月?(\d{1,2})日?[（(]?[月火水木金土日]?[）)]?/);
    
    if (yearMatch && monthMatch && dayMatch) {
      const year = parseInt(yearMatch[1], 10);
      const month = parseInt(monthMatch[1], 10) - 1; // Dateオブジェクトでは月は0ベース
      const day = parseInt(dayMatch[1], 10);
      return new Date(year, month, day);
    }
    
    // フォールバック: 元の文字列をそのままDateコンストラクタに渡す
    const fallbackDate = new Date(dateString);
    return isNaN(fallbackDate.getTime()) ? new Date(0) : fallbackDate;
  };

  // イベントを日付順でソート
  const sortedEventList = [...eventList].sort((a, b) => {
    const dateA = extractDate(a["開催期間"] as string);
    const dateB = extractDate(b["開催期間"] as string);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="events-page">
      <h1 className="events-title">イベント一覧</h1>
      <div className="events-list">
        {eventList.length === 0 && <div>イベント情報がありません</div>}
        {sortedEventList.map((event) => {
          const imageUrl = event["画像URL1"] as string | undefined;
          return (
            <div key={event.index} className="event-card" onClick={() => showEventDetail(event)}>
              {imageUrl && (
                <div className="event-card-image-wrapper">
                  <img src={imageUrl} alt={event["イベント名"]} className="event-card-image" />
                </div>
              )}
              <div className="event-card-content">
                <div className="event-card-header">
                  <span className="event-name">{event["イベント名"]}</span>
                  <span className="event-date">{event["開催期間"]}</span>
                </div>
                <div className="event-place">{event["場所"]?.replace(/〒\d{3}-\d{4}\s*/, '')}</div>
                {/* <div className="event-description">{event["説明文"]?.slice(0, 60)}...</div> */}
              </div>
            </div>
          );
        })}
      </div>
      {selectedEvent && (
        <div className="event-detail-modal" onClick={closeDetail}>
          <div className="event-detail" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeDetail}>×</button>
            <h2 className="event-detail-title">{selectedEvent["イベント名"]}</h2>
            <div className="event-detail-section event-detail-date"><strong>開催期間:</strong> {selectedEvent["開催期間"]}</div>
            <div className="event-detail-section event-detail-place"><strong>場所:</strong> {selectedEvent["場所"] && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((selectedEvent["場所"] as string).replace(/〒\d{3}-\d{4}\s*/, ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1976d2', fontWeight: 'bold', textDecoration: 'underline' }}
              >{(selectedEvent["場所"] as string).replace(/〒\d{3}-\d{4}\s*/, '')}</a>
            )}</div>
            <div className="event-detail-section event-detail-time">
              <strong>開催時間：</strong> 
              <span className="event-time-value">
                {selectedEvent["開始/終了時間"] && (selectedEvent["開始/終了時間"] as string).split(' / ').map((time, timeIndex) => <React.Fragment key={timeIndex}>{time}{timeIndex < (selectedEvent["開始/終了時間"] as string).split(' / ').length - 1 && <br />}</React.Fragment>)}
              </span>
            </div>
            <div className="event-detail-section event-detail-description">{selectedEvent["説明文"]}</div>
            {/* 公式サイト・SNSリンク */}
            <div className="event-detail-section event-detail-links">
              {selectedEvent["公式サイト"] && (
                <a href={selectedEvent["公式サイト"]} target="_blank" rel="noopener noreferrer" className="event-link official-site-link">
                  公式サイト
                </a>
              )}
              {selectedEvent["Instagram"] && (
                <a href={selectedEvent["Instagram"].startsWith('http') ? selectedEvent["Instagram"] : `https://instagram.com/${selectedEvent["Instagram"]}`} target="_blank" rel="noopener noreferrer" title="Instagram" className="event-link social-link">
                  <i className="fab fa-instagram"></i>
                </a>
              )}
              {selectedEvent["Facebook"] && (
                <a href={selectedEvent["Facebook"].startsWith('http') ? selectedEvent["Facebook"] : `https://www.facebook.com/${selectedEvent["Facebook"]}`} target="_blank" rel="noopener noreferrer" title="Facebook" className="event-link social-link">
                  <i className="fab fa-facebook"></i>
                </a>
              )}
              {selectedEvent["X"] && (
                <a href={selectedEvent["X"].startsWith('http') ? selectedEvent["X"] : `https://twitter.com/${selectedEvent["X"]}`} target="_blank" rel="noopener noreferrer" title="X (旧Twitter)" className="event-link social-link">
                  <i className="fab fa-x-twitter"></i>
                </a>
              )}
            </div>
            <div className="event-detail-section event-detail-organizer"><strong>主催:</strong> {selectedEvent["主催者名"]}</div>
            {selectedEvent["タグ"] && (
              <div className="event-detail-section event-detail-tags">
                <strong>タグ:</strong>
                <div className="tags-container">
                  {(selectedEvent["タグ"] as string).split(/[,、\s]+/).map((tag, index) => (
                    tag.trim() && <span key={index} className="tag-item">{tag.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="event-detail-images">
              {[1,2,3,4,5,6].map(n => {
                const url = selectedEvent[`画像URL${n}` as keyof EventData] as string | undefined;
                return url ? (
                  <img
                    key={n}
                    src={url}
                    alt={`イベント画像${n}`}
                    onClick={() => setImageModalUrl(url)}
                    style={{ cursor: 'pointer' }}
                  />
                ) : null;
              })}
            </div>
            {imageModalUrl && (
              <div className="image-modal" onClick={() => setImageModalUrl(null)}>
                <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                  <img src={imageModalUrl} alt="拡大画像" />
                </div>
              </div>
            )}
            {selectedEvent["緯度"] && selectedEvent["経度"] && (
              <div className="event-detail-map" style={{width: '100%', height: '250px', marginTop: '16px'}}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEvent["緯度"]},${selectedEvent["経度"]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-route-link"
                  style={{ display: 'block', marginBottom: '8px', color: '#1976d2', fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center' }}
                >ここまでのルート</a>
                <iframe
                  width="100%"
                  height="200"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps?q=${selectedEvent["緯度"]},${selectedEvent["経度"]}&z=16&output=embed`}
                  allowFullScreen
                  title="イベント地図"
                ></iframe>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;