/* 
Full Path: /src/App.tsx
Last Modified: 2025-02-28 17:45:00
*/

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { parseCsvByHeader, stripWrappingQuotes } from './lib/csv';
import { GeolocationProvider } from './context/GeolocationContext';
import Dashboard from './App/Dashboard';
import Category from './App/Category';
import Images from './App/Images';
import AboutUs from './App/AboutUs';
import Events from './App/Events';
import Tabbar from './App/Tabbar';
import LazyMap from './App/LazyMap';
import { MapPointBase } from './App/Map';
import Calendar from './App/Calendar'; // 追加
import SearchView from './App/SearchView'; // 新規追加
import { useAutoUpdate } from './hooks/useAutoUpdate'; // PWA自動更新
import { UpdateIndicator } from './components/UpdateIndicator'; // 更新インジケーター
import InstallPrompt from './components/InstallPrompt'; // PWAインストール促進
import config from "./config.json";
import './App.scss';

const App: React.FC = React.memo(() => {
  const [shopList, setShopList] = useState<Pwamap.FestivalData[]>([]);
  const [error, setError] = useState<string>("");
  const [selectedShop, setSelectedShop] = useState<Pwamap.FestivalData | undefined>(undefined);
  const [filteredShops, setFilteredShops] = useState<Pwamap.FestivalData[]>([]);
  const location = useLocation();

  // PWA自動更新システム
  const { isChecking, updateApplied } = useAutoUpdate();

  const sortShopList = useCallback((shopList: Pwamap.FestivalData[]) => {
    return new Promise<Pwamap.FestivalData[]>((resolve) => {
      const sortedList = [...shopList].sort((item1, item2) => {
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
      resolve(sortedList);
    });
  }, []);

  useEffect(() => {
    setError("");
    const cacheKey = "shopListCache";
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setShopList(parsed);
        // バックグラウンドで最新データ取得
        fetch(config.data_url)
          .then((response) => {
            if (!response.ok) throw new Error("データの取得に失敗しました");
            return response.text();
          })
          .then((data) => {
            const features = parseCsvByHeader<Pwamap.FestivalData>(data, {
              requiredFields: ['緯度', '経度', 'お祭り名'],
              transform: (record, i) => {
                const feature = { ...(record as any) } as Pwamap.FestivalData;
                // 緯度経度の数値形式チェック（負の値も許可）
                if (!feature['緯度'] || !feature['経度']) return null;
                if (!feature['緯度'].toString().match(/^-?[0-9]+(\.[0-9]+)?$/)) return null;
                if (!feature['経度'].toString().match(/^-?[0-9]+(\.[0-9]+)?$/)) return null;
                // 文字列フィールドのクリーニング
                const stringFields = ['お祭り名', '開催場所名', '上位カテゴリ', '規模感', '開催ステータス'];
                stringFields.forEach((field) => {
                  const v = (feature as any)[field];
                  if (typeof v === 'string') (feature as any)[field] = v.trim();
                });
                // URL フィールドのクリーニング
                const urlFields = ['写真URL', '公式サイトURL'];
                urlFields.forEach((field) => {
                  const v = (feature as any)[field];
                  if (typeof v === 'string') (feature as any)[field] = stripWrappingQuotes(v.trim());
                });
                return { ...feature, index: i } as Pwamap.FestivalData;
              }
            });
            sortShopList(features).then((sortedShopList) => {
              if (JSON.stringify(parsed) !== JSON.stringify(sortedShopList)) {
                setShopList(sortedShopList);
                sessionStorage.setItem(cacheKey, JSON.stringify(sortedShopList));
              }
            });
          })
           .catch((e) => {
             setError(e.message);
           });
        return;
      } catch (e) {
        // パース失敗時は通常フロー
      }
    }
    // キャッシュなし時は通常取得
    fetch(config.data_url)
      .then((response) => {
        if (!response.ok) throw new Error("データの取得に失敗しました");
        return response.text();
      })
      .then((data) => {
        const features = parseCsvByHeader<Pwamap.FestivalData>(data, {
          requiredFields: ['緯度', '経度', 'お祭り名'],
          transform: (record, i) => {
            const feature = { ...(record as any) } as Pwamap.FestivalData;
            if (!feature['緯度'] || !feature['経度']) return null;
            if (!feature['緯度'].toString().match(/^-?[0-9]+(\.[0-9]+)?$/)) return null;
            if (!feature['経度'].toString().match(/^-?[0-9]+(\.[0-9]+)?$/)) return null;
            const stringFields = ['お祭り名', '開催場所名', '上位カテゴリ', '規模感', '開催ステータス'];
            stringFields.forEach((field) => {
              const v = (feature as any)[field];
              if (typeof v === 'string') (feature as any)[field] = v.trim();
            });
            const urlFields = ['写真URL', '公式サイトURL'];
            urlFields.forEach((field) => {
              const v = (feature as any)[field];
              if (typeof v === 'string') (feature as any)[field] = stripWrappingQuotes(v.trim());
            });
            return { ...feature, index: i } as Pwamap.FestivalData;
          }
        });
        sortShopList(features).then((sortedShopList) => {
          setShopList(sortedShopList);
          sessionStorage.setItem(cacheKey, JSON.stringify(sortedShopList));
        });
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [sortShopList]);

  // 店舗選択ハンドラ
  const handleSelectShop = useCallback((shop: MapPointBase | undefined) => {
    if (shop) {
      // shopListから対応するFestivalDataを見つける
      const fullShopData = shopList.find(item => item.index === shop.index);
      setSelectedShop(fullShopData); // fullShopDataはFestivalData | undefined型
    } else {
      setSelectedShop(undefined);
    }
  }, [shopList]); // shopListを依存配列に追加

  // データが更新されたときにフィルタリング結果も更新
  useEffect(() => {
    if (shopList.length > 0) {
      setFilteredShops(shopList);
    }
  }, [shopList]);

  // 永続化されたMapコンポーネント
  const persistentMap = useMemo(() => {
    // カレンダータブでは地図を非表示にする
    if (location.pathname === '/calendar') {
      return null;
    }
    
    return (
      <LazyMap
        data={filteredShops} 
        selectedShop={selectedShop}
        onSelectShop={handleSelectShop}
        initialData={shopList}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: 'calc(100% - 50px)',
          zIndex: location.pathname === '/search' ? 1 : -1, // 検索ページでのみ地図を前面表示
          pointerEvents: location.pathname === '/search' ? 'auto' : 'none'
        }}
      />
    );
  }, [filteredShops, selectedShop, handleSelectShop, shopList, location.pathname]);

  // メモ化されたルートコンポーネント
  const routes = useMemo(() => (
    <Routes>
      <Route path="/" element={
        <Dashboard 
          data={shopList} 
          onSelectShop={handleSelectShop}
        />
      } />
      <Route path="/search" element={ // /map と /list を /search に統合
        <SearchView
          events={shopList}
        />
      } />
      <Route path="/category" element={<Category data={shopList} />} />
      <Route path="/images" element={<Images data={shopList} />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/events" element={<Events />} />
      <Route path="/calendar" element={ // /calendar ルートを追加
        <>
          {console.log('Rendering Calendar route with data:', shopList?.length || 0)}
          <Calendar
            data={shopList}
          />
        </>
      } />
      <Route path="/info" element={<AboutUs />} /> {/* /info ルートを追加 */}
    </Routes>
  ), [shopList, handleSelectShop]);

  if (error) return <div className="app-error">{error}</div>;

  return (
    <GeolocationProvider>
      <div className="app">
        <div className="app-body">
          {routes}
        </div>
        {persistentMap}
        <div id="modal-root"></div>
        <div className="app-footer">
          <Tabbar />
        </div>
        {/* PWA自動更新インジケーター */}
        <UpdateIndicator isChecking={isChecking} updateApplied={updateApplied} />
        {/* PWAインストール促進 */}
        <InstallPrompt />
      </div>
    </GeolocationProvider>
  );
});

App.displayName = 'App';

export default App;
