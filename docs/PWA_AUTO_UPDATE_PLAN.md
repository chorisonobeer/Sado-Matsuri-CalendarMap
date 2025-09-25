# PWA自動更新システム実装計画書

## 📋 **概要**

PWAアプリが常に確実に最新版のデプロイを取得するための自動更新システムを実装します。

## 🎯 **要件**

### 必須要件
- ✅ **確実性**: 新しいデプロイが確実に反映される
- ✅ **低コスト**: 最小限のコード変更とリソース使用
- ✅ **ユーザビリティ**: ユーザーに分かりやすい更新通知
- ✅ **パフォーマンス**: アプリの動作速度に影響しない

### 技術要件
- React Service Worker対応
- Netlifyデプロイとの連携
- ブラウザキャッシュ制御
- バージョン管理システム

## 🔍 **アプローチ比較分析**

### アプローチ1: Service Worker + Version Check ⭐ **推奨**

#### 仕組み
1. **ビルド時バージョン生成**: `version.json`ファイルを自動生成
2. **定期チェック**: Service Workerが定期的にバージョンをチェック
3. **更新検出**: 新バージョン検出時にユーザーに通知
4. **強制更新**: ユーザー承認後にキャッシュクリア + リロード

#### 技術実装
```typescript
// version.json (ビルド時自動生成)
{
  "version": "2024-12-25T10:30:45.123Z",
  "buildId": "65d44dc",
  "deployUrl": "https://sado-matsuri-calender.netlify.app"
}

// Service Worker
self.addEventListener('message', (event) => {
  if (event.data.type === 'CHECK_VERSION') {
    checkForUpdates();
  }
});

// React App
useEffect(() => {
  const checkInterval = setInterval(checkForUpdates, 30000); // 30秒間隔
  return () => clearInterval(checkInterval);
}, []);
```

#### メリット
- ✅ **確実性**: Service Workerによる確実な更新検出
- ✅ **低コスト**: 軽量なJSONファイルのみ
- ✅ **ユーザー制御**: ユーザーが更新タイミングを選択可能
- ✅ **オフライン対応**: Service Workerの標準機能

#### デメリット
- ⚠️ **実装複雑度**: Service Worker設定が必要

### アプローチ2: Meta Tag + Hash Check

#### 仕組み
1. **HTMLメタタグ**: `<meta name="build-version" content="timestamp">`
2. **定期取得**: アプリがHTMLのメタタグを定期取得
3. **比較**: 現在のバージョンと比較
4. **更新**: 差分検出時にリロード

#### メリット
- ✅ **シンプル**: 実装が簡単
- ✅ **軽量**: HTTPリクエストのみ

#### デメリット
- ❌ **信頼性**: HTMLキャッシュの影響を受ける可能性
- ❌ **CORS**: 同一オリジンでないと取得困難

### アプローチ3: Netlify API Integration

#### 仕組み
1. **Netlify API**: デプロイ情報をAPIで取得
2. **デプロイID比較**: 最新のデプロイIDと比較
3. **更新検出**: 新しいデプロイを検出

#### メリット
- ✅ **正確性**: Netlifyの公式情報
- ✅ **詳細情報**: デプロイ時刻、コミットIDなど

#### デメリット
- ❌ **API制限**: レート制限の可能性
- ❌ **依存性**: Netlify固有の実装

## 🏆 **推奨実装: Service Worker + Version Check**

### 実装ステップ

#### Step 1: ビルド時バージョン生成
```javascript
// scripts/generate-version.js
const fs = require('fs');
const { execSync } = require('child_process');

const version = {
  timestamp: new Date().toISOString(),
  buildId: execSync('git rev-parse --short HEAD').toString().trim(),
  buildTime: Date.now()
};

fs.writeFileSync('public/version.json', JSON.stringify(version, null, 2));
```

#### Step 2: Service Worker拡張
```typescript
// public/sw.js (既存のService Workerに追加)
let currentVersion = null;

async function checkForUpdates() {
  try {
    const response = await fetch('/version.json', { 
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const newVersion = await response.json();
    
    if (currentVersion && newVersion.timestamp !== currentVersion.timestamp) {
      // 新しいバージョンを検出
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            version: newVersion
          });
        });
      });
    }
    
    currentVersion = newVersion;
  } catch (error) {
    console.error('Version check failed:', error);
  }
}

// 定期チェック
setInterval(checkForUpdates, 30000); // 30秒間隔
```

#### Step 3: React App統合
```typescript
// src/hooks/useAppUpdate.ts
export const useAppUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NEW_VERSION_AVAILABLE') {
          setUpdateAvailable(true);
          setNewVersion(event.data.version);
        }
      });
    }
  }, []);

  const applyUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
        window.location.reload();
      });
    }
  };

  return { updateAvailable, newVersion, applyUpdate };
};
```

#### Step 4: UI通知コンポーネント
```typescript
// src/components/UpdateNotification.tsx
export const UpdateNotification = () => {
  const { updateAvailable, applyUpdate } = useAppUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="update-notification">
      <div className="update-content">
        <span>新しいバージョンが利用可能です</span>
        <button onClick={applyUpdate}>更新</button>
      </div>
    </div>
  );
};
```

### ファイル構成

```
src/
├── hooks/
│   └── useAppUpdate.ts          # 更新検出フック
├── components/
│   └── UpdateNotification.tsx   # 更新通知UI
└── App.tsx                      # メインアプリ（通知コンポーネント追加）

public/
├── sw.js                        # Service Worker（拡張）
├── version.json                 # バージョン情報（自動生成）
└── manifest.json               # PWA設定

scripts/
└── generate-version.js          # ビルド時バージョン生成

package.json                     # ビルドスクリプト追加
```

## 📊 **実装コスト分析**

### 開発コスト
- **新規ファイル**: 4ファイル
- **既存ファイル修正**: 3ファイル
- **実装時間**: 約2-3時間

### 運用コスト
- **追加リクエスト**: 30秒間隔で軽量JSON取得（~100B）
- **ストレージ**: version.json（~200B）
- **パフォーマンス影響**: 無視できるレベル

### メンテナンスコスト
- **自動化**: ビルド時に自動実行
- **手動作業**: なし

## 🔒 **セキュリティ考慮事項**

### キャッシュ制御
```typescript
// version.jsonのキャッシュを無効化
fetch('/version.json', { 
  cache: 'no-cache',
  headers: { 'Cache-Control': 'no-cache' }
});
```

### エラーハンドリング
```typescript
// ネットワークエラー時の適切な処理
try {
  await checkForUpdates();
} catch (error) {
  // サイレントに失敗、ユーザーには影響しない
  console.warn('Update check failed:', error);
}
```

## 🎯 **期待される効果**

### ユーザーエクスペリエンス
- ✅ **常に最新**: 新機能やバグ修正を即座に利用可能
- ✅ **透明性**: 更新の有無が明確
- ✅ **制御性**: ユーザーが更新タイミングを選択

### 開発・運用効率
- ✅ **自動化**: 手動作業なしで更新配信
- ✅ **確実性**: キャッシュ問題の解決
- ✅ **監視**: 更新状況の把握

## 📝 **実装スケジュール**

### Phase 1: 基盤実装（1時間）
1. バージョン生成スクリプト作成
2. package.jsonビルドスクリプト修正
3. version.json生成確認

### Phase 2: Service Worker拡張（1時間）
1. 既存Service Workerに更新チェック機能追加
2. メッセージ通信実装
3. 定期チェック機能実装

### Phase 3: React統合（1時間）
1. useAppUpdateフック実装
2. UpdateNotificationコンポーネント実装
3. App.tsxに統合

### Phase 4: テスト・調整（30分）
1. ローカル環境でのテスト
2. Netlifyデプロイでの動作確認
3. 最終調整

## ✅ **承認後の実装手順**

1. **計画承認確認**
2. **Phase 1から順次実装**
3. **各Phaseでのテスト実行**
4. **最終的な動作確認**
5. **GitHubプッシュ・Netlifyデプロイ**

---

**この計画で実装を進めてよろしいでしょうか？**

低コストで確実に動作し、ユーザーエクスペリエンスも向上する実装になります。
