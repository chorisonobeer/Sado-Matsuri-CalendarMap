/* 
Full Path: /src/App/Home.tsx
Last Modified: 2025-03-19 17:30:00
*/

import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Shop from './Shop';
import SearchFeature from './SearchFeature';
import './Home.scss';

type Props = {
  data: Pwamap.FestivalData[];
  selectedShop?: Pwamap.FestivalData;
  onSelectShop: (shop: Pwamap.FestivalData) => void;
  onSearchResults: (results: Pwamap.FestivalData[]) => void;
};

const Home: React.FC<Props> = React.memo((props) => {
  const { data, selectedShop, onSelectShop, onSearchResults } = props;

  // 親コンポーネントからのデータを設定（メモ化）
  const memoizedData = useMemo(() => data, [data]);

  // Shop閉じる処理
  const handleCloseShop = useCallback(() => {
    onSelectShop(undefined as any);
  }, [onSelectShop]);

  // メモ化されたコンポーネント
  const searchFeature = useMemo(() => (
    <SearchFeature 
      data={memoizedData}
      onSelectShop={onSelectShop}
      onSearchResults={onSearchResults}
    />
  ), [memoizedData, onSelectShop, onSearchResults]);

  const shopModal = useMemo(() => {
    if (!selectedShop) return null;
    return ReactDOM.createPortal(
      <Shop shop={selectedShop} close={handleCloseShop} />,
      document.getElementById('modal-root') as HTMLElement
    );
  }, [selectedShop, handleCloseShop]);

  return (
    <div className="home">
      {searchFeature}
      {shopModal}
    </div>
  );
});

Home.displayName = 'Home';

export default Home;