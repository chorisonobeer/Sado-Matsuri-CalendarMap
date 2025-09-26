import React, { useState, useEffect } from 'react';
import './InstallPrompt.scss';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWAがすでにインストールされているかチェック
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // iOS Safari のスタンドアロンモードチェック
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 初回訪問から少し遅らせて表示
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
      } else {
        console.log('PWA installation dismissed');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 24時間後に再表示
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // 既にインストール済みまたはプロンプトが利用できない場合は表示しない
  if (isInstalled || !deferredPrompt || !showPrompt) {
    return null;
  }

  // 24時間以内に却下された場合は表示しない
  const lastDismissed = localStorage.getItem('installPromptDismissed');
  if (lastDismissed && Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000) {
    return null;
  }

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt">
        <button className="install-prompt__close" onClick={handleDismiss}>
          ×
        </button>
        
        <div className="install-prompt__content">
          <div className="install-prompt__icon">
            <img src="/manifest-icon-192.maskable.png" alt="アプリアイコン" />
          </div>
          
          <h3 className="install-prompt__title">
            佐渡のお祭りカレンダーマップをインストール
          </h3>
          
          <p className="install-prompt__description">
            アプリをインストールすると、いつでも素早く佐渡の祭り情報にアクセスできます。
            オフラインでも基本機能が利用可能になります。
          </p>
          
          <div className="install-prompt__features">
            <div className="feature">
              <span className="feature__icon">🎭</span>
              <span className="feature__text">最新の祭り情報</span>
            </div>
            <div className="feature">
              <span className="feature__icon">🗺️</span>
              <span className="feature__text">詳細な地図表示</span>
            </div>
            <div className="feature">
              <span className="feature__icon">📱</span>
              <span className="feature__text">オフライン対応</span>
            </div>
          </div>
          
          <div className="install-prompt__actions">
            <button 
              className="install-prompt__install-btn"
              onClick={handleInstallClick}
            >
              インストール
            </button>
            <button 
              className="install-prompt__later-btn"
              onClick={handleDismiss}
            >
              後で
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
