import { useEffect, useState } from 'react';

interface VersionInfo {
  timestamp: string;
  buildId: string;
  buildTime: number;
  version: string;
}

export const useAutoUpdate = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [updateApplied, setUpdateApplied] = useState(false);

  const checkForUpdates = async (): Promise<boolean> => {
    try {
      setIsChecking(true);
      
      // 現在のバージョンを取得（初回起動時はnull）
      const currentVersionStr = localStorage.getItem('app-version');
      
      // 最新のバージョン情報を取得
      const response = await fetch('/version.json', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.warn('Version check failed: HTTP', response.status);
        return false;
      }
      
      const latestVersion: VersionInfo = await response.json();
      
      // 初回起動時は現在のバージョンとして保存
      if (!currentVersionStr) {
        localStorage.setItem('app-version', JSON.stringify(latestVersion));
        console.log('✅ Initial version saved:', latestVersion.version);
        return false;
      }
      
      const currentVersion: VersionInfo = JSON.parse(currentVersionStr);
      
      // バージョン比較（buildTimeで比較）
      if (latestVersion.buildTime > currentVersion.buildTime) {
        console.log('🔄 New version detected:', {
          current: currentVersion.version,
          latest: latestVersion.version
        });
        
        // 新しいバージョンを保存
        localStorage.setItem('app-version', JSON.stringify(latestVersion));
        
        // 自動更新実行
        await applyUpdate();
        return true;
      }
      
      console.log('✅ App is up to date:', currentVersion.version);
      return false;
      
    } catch (error) {
      console.error('❌ Version check failed:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const applyUpdate = async (): Promise<void> => {
    try {
      console.log('🔄 Applying update...');
      
      // Service Workerのキャッシュをクリア
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      }
      
      // ブラウザキャッシュをクリア
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      setUpdateApplied(true);
      
      // 少し待ってからリロード（ユーザーに更新中であることを示すため）
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Update failed:', error);
      // エラーが発生してもリロードを試行
      window.location.reload();
    }
  };

  // アプリ起動時に自動チェック実行
  useEffect(() => {
    // 少し遅延させてアプリの初期化を優先
    const timer = setTimeout(() => {
      checkForUpdates();
    }, 2000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isChecking,
    updateApplied,
    checkForUpdates
  };
};
