# 調査報告書：情報タブルーティング問題

## 問題の確認

**現象**: 情報タブをクリックすると、AboutUsページではなく地図が表示される

## 調査結果

### 1. ルーティング設定の確認

**App.tsx**での設定:
- `/info` ルート → `<AboutUs />` コンポーネント（正常）
- `/about` ルート → `<AboutUs />` コンポーネント（正常）

**Tabbar.tsx**での設定:
- 情報タブのリンク先 → `/info`（正常）

### 2. 実際の動作確認

ブラウザでの検証結果:
- 情報タブクリック後のURL: `http://localhost:3000/#/info`（正常）
- 表示内容: 地図画面（**問題発生**）

### 3. 原因分析

App.tsxの以下の部分で問題を発見:

```typescript
const persistentMap = useMemo(() => {
  return (
    <LazyMap
      // ... 省略
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 'calc(100% - 50px)',
        zIndex: location.pathname === '/' ? -1 : 1, // ← 問題箇所
        pointerEvents: location.pathname === '/' ? 'none' : 'auto'
      }}
    />
  );
}, [filteredShops, selectedShop, handleSelectShop, shopList, location.pathname]);
```

**問題の原因**:
- 地図コンポーネント（LazyMap）が常に表示されている
- ホームページ（`/`）以外では`zIndex: 1`で前面に表示される
- `/info`ページでも地図が前面に表示され、AboutUsコンポーネントが隠れている

## 修正方針

地図を表示すべきページを限定し、情報ページでは地図を非表示にする必要がある。

具体的には、zIndexとpointerEventsの条件を以下のように修正:
- 地図を表示: `/search`ページのみ
- 地図を非表示: その他のページ（`/`, `/info`, `/about`, `/calendar`など）

## 修正の緊急度

**高**: ユーザーが情報ページにアクセスできない重要な問題
