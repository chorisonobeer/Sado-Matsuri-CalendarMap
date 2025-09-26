# カレンダー改善設計書

## 目標

1. **複数日イベントの連続バー表示**: 開始日から終了日まで連続したバーで表示
2. **複数イベントの色分け**: 1日に複数のイベントがある場合の色分け表示

## 実装方針

### 1. 色分けシステム

イベントごとに一意の色を割り当てるシステムを実装：

```typescript
// カラーパレット定義
const EVENT_COLORS = [
  '#1a73e8', // 青
  '#34a853', // 緑
  '#ea4335', // 赤
  '#fbbc04', // 黄
  '#9c27b0', // 紫
  '#ff6d01', // オレンジ
  '#00acc1', // シアン
  '#795548', // 茶
  '#607d8b', // 青灰
  '#e91e63'  // ピンク
];

// イベント名のハッシュ値から色を決定
const getEventColor = (eventName: string) => {
  const hash = eventName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
};
```

### 2. 連続バー表示システム

複数日にまたがるイベントを連続したバーで表示：

```typescript
// イベントの表示期間を計算
const getEventDisplayPeriod = (event: FestivalData, calendarDays: Date[]) => {
  const startDate = new Date(event.開始日);
  const endDate = new Date(event.終了日 || event.開始日);
  
  const startIndex = calendarDays.findIndex(day => 
    day.toDateString() === startDate.toDateString()
  );
  const endIndex = calendarDays.findIndex(day => 
    day.toDateString() === endDate.toDateString()
  );
  
  return { startIndex, endIndex, duration: endIndex - startIndex + 1 };
};
```

### 3. レイアウト調整

- 各日のセルで複数イベントを縦に積み重ね表示
- 連続バーは横方向に伸びるスタイル
- 最大表示件数を調整（モバイル: 2件、デスクトップ: 3件）

## 実装手順

1. カラーパレットとハッシュ関数の実装
2. 連続バー表示ロジックの実装
3. CSSスタイルの調整
4. レスポンシブ対応の確認

## 期待される効果

- Googleカレンダーライクな直感的なUI
- 複数日イベントの視認性向上
- 同日複数イベントの識別性向上
