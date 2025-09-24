/* 
Full Path: /src/App.tsx
Last Modified: 2025-02-28 17:45:00
*/

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { parseCsvByHeader, stripWrappingQuotes } from './lib/csv';
import { GeolocationProvider } from './context/GeolocationContext';
import Dashboard from './App/Dashboard';
import Home from './App/Home';
import List from './App/List';
import Category from './App/Category';
import Images from './App/Images';
import AboutUs from './App/AboutUs';
import Events from './App/Events';
import Tabbar from './App/Tabbar';
import LazyMap from './App/LazyMap';
import config from "./config.json";
import './App.scss';

const App: React.FC = React.memo(() => {
  const [shopList, setShopList] = useState<Pwamap.FestivalData[]>([]);
  const [error, setError] = useState<string>("");
  const [selectedShop, setSelectedShop] = useState<Pwamap.FestivalData | undefined>(undefined);
  const [filteredShops, setFilteredShops] = useState<Pwamap.FestivalData[]>([]);
  const location = useLocation();

  const sortShopList = useCallback((shopList: Pwamap.FestivalData[]) => {
    return new Promise<Pwamap.FestivalData[]>((resolve) => {
      const sortedList = shopList.sort((item1, item2) => {
        return Date.parse(item2['タイムスタンプ']) - Date.parse(item1['タイムスタンプ']);
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
  const handleSelectShop = useCallback((shop: Pwamap.FestivalData) => {
    setSelectedShop(shop);
  }, []);

  const handleSearchResults = useCallback((results: Pwamap.FestivalData[]) => {
    setFilteredShops(results);
  }, []);

  // データが更新されたときにフィルタリング結果も更新
  useEffect(() => {
    if (shopList.length > 0) {
      setFilteredShops(shopList);
    }
  }, [shopList]);

  // 永続化されたMapコンポーネント
  const persistentMap = useMemo(() => {
    return (
      <LazyMap
        data={filteredShops} 
        selectedShop={selectedShop}
        onSelectShop={handleSelectShop}
        initialData={shopList}
        style={{ 
          display: location.pathname === '/' ? 'none' : 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 'calc(100% - 50px)',
          zIndex: location.pathname === '/' ? -1 : 5,
          pointerEvents: location.pathname === '/' ? 'none' : 'auto'
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
          selectedShop={selectedShop}
          onSelectShop={handleSelectShop}
          onSearchResults={handleSearchResults}
        />
      } />
      <Route path="/home" element={
        <Home 
          data={shopList} 
          selectedShop={selectedShop}
          onSelectShop={handleSelectShop}
          onSearchResults={handleSearchResults}
        />
      } />
      <Route path="/list" element={<List data={shopList} />} />
      <Route path="/category" element={<Category data={shopList} />} />
      <Route path="/images" element={<Images data={shopList} />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/events" element={<Events />} />
    </Routes>
  ), [shopList, selectedShop, handleSelectShop, handleSearchResults]);

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
      </div>
    </GeolocationProvider>
  );
});

App.displayName = 'App';

export default App;
