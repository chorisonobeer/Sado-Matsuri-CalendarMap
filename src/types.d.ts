declare global {
  interface Window {
    geolonia?: any;
  }
}

declare namespace Pwamap {
  interface ShopData {
    index: number;
    [key: string]: any;
  }

  interface EventData {
    index: number;
    イベント名: string;
    開催期間: string;
    開催場所: string;
    緯度: number;
    経度: number;
    詳細: string;
    写真: string;
    公式サイト: string;
    [key: string]: any;
  }

  // 佐渡祭りカレンダー用の新しい型定義
  interface FestivalData {
    index: number;
    ID: string;
    お祭り名: string;
    開催場所名: string;
    緯度: string;  // MapPointBaseとの互換性のため文字列型に変更
    経度: string;  // MapPointBaseとの互換性のため文字列型に変更
    開始日: string;
    終了日: string;
    無料か有料か: string;
    駐車場の有無: string;
    上位カテゴリ: string;
    規模感: string;
    開催ステータス: string;
    写真URL1: string;
    写真URL2: string;
    写真URL3: string;
    写真URL4: string;
    写真URL5: string;
    公式サイトURL: string;
    詳細タグ1: string;
    詳細タグ2: string;
    詳細タグ3: string;
    詳細タグ4: string;
    詳細タグ5: string;
    詳細タグ6: string;
    詳細タグ7: string;
    詳細タグ8: string;
    [key: string]: any;
  }
}