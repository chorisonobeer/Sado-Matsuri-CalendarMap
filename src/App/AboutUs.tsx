/** 
 * /src/App/AboutUs.tsx
 * 2025-05-02T10:00+09:00
 * 変更概要: 新潟クラフトビールマップ向けに全面リライト - UIデザイン改善
 */
import { useEffect, useState } from 'react';
import './AboutUs.scss';
import config from '../config.json';
import { FaPlus, FaBeer, FaMapMarkedAlt, FaSearch, FaCamera, FaInfoCircle } from 'react-icons/fa';
import { getVersionDisplayString, getDetailedVersionString, getStoredVersion } from '../utils/version';

// スポンサー企業情報の型定義
type Sponsor = {
  name: string;
  imageUrl: string;
  linkUrl: string;
};

// スポンサー企業のダミーデータ
const sponsors: Sponsor[] = [
  { name: 'ダミースポンサー1', imageUrl: '/sponsors/dummy1.png', linkUrl: '#' },
  { name: 'ダミースポンサー2', imageUrl: '/sponsors/dummy2.png', linkUrl: '#' },
  { name: 'ダミースポンサー3', imageUrl: '/sponsors/dummy3.png', linkUrl: '#' },
  { name: 'ダミースポンサー4', imageUrl: '/sponsors/dummy4.png', linkUrl: '#' },
  { name: 'ダミースポンサー5', imageUrl: '/sponsors/dummy5.png', linkUrl: '#' },
  { name: 'ダミースポンサー6', imageUrl: '/sponsors/dummy6.png', linkUrl: '#' },
];

const Content = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showVersionInfo, setShowVersionInfo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const clickHandler = () => {
    if (config.form_url) {
      window.location.href = config.form_url;
    }
  };

  return (
    <div className="about-us">
      <div className={`hero-section ${isVisible ? 'visible' : ''}`}>
        <div className="hero-gradient"></div>
        <div className="hero-content">
          <h1 className="hero-title">NIIGATA CRAFT BEER MAP</h1>
          <p className="hero-subtitle">新潟のクラフトビールを、もっと身近に、もっとクールに。</p>
          <div className="hero-image-container">
            <img src="/dummy-hero.jpg" alt="新潟クラフトビールイメージ" className="hero-image" />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="content-card">
          <h2 
            className="section-title clickable-title" 
            onClick={() => setShowVersionInfo(!showVersionInfo)}
            title="クリックでアプリ情報を表示"
          >
            このマップについて
          </h2>
          <p>
            「NIIGATA CRAFT BEER MAP」は、新潟県内のクラフトビールが飲めるお店・買えるお店を一目で探せるデジタルマップです。<br />
            新潟の豊かな自然と職人の情熱が生み出すクラフトビールの魅力を、もっと多くの人に知ってほしい。<br />
            そんな想いからこのマップは生まれました。
          </p>
          <p>
            <strong>どこで飲める？どこで買える？</strong>——そんな疑問をすぐに解決！<br />
            地元の方も、観光で訪れた方も、新潟のクラフトビールを気軽に楽しめるお店やショップを簡単に見つけられます。
          </p>
          <p>
            新潟のクラフトビール文化を、みんなで盛り上げましょう！
          </p>
        </div>

        <div className="content-card">
          <h2 className="section-title">マップの使い方</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon"><FaMapMarkedAlt /></div>
              <h3>ホーム画面</h3>
              <p>地図上でビアバーや販売店の位置を確認。マーカーをタップすると詳細が表示されます。</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><FaBeer /></div>
              <h3>一覧画面</h3>
              <p>すべてのお店・ショップをリスト形式で表示。現在地からの距離順にも並びます。</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><FaCamera /></div>
              <h3>写真から探す</h3>
              <p>お店やビールの写真を一覧でチェック。気になる写真から詳細へ。</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><FaSearch /></div>
              <h3>検索機能</h3>
              <p>キーワードやカテゴリで絞り込み検索が可能です。</p>
            </div>
          </div>
          <p className="additional-info">
            各店舗ページでは、営業時間、定休日、住所、写真、取扱ビールの情報などを確認できます。
            また、電話や公式サイトへのリンクから直接問い合わせ・予約も可能です。
          </p>
        </div>

        <div className="content-card">
          <h2 className="section-title">スポンサー</h2>
          <p>本マップは以下のスポンサー様のご支援により運営されています。</p>
          <div className="sponsors-grid">
            {sponsors.map((sponsor, index) => (
              <div key={index} className="sponsor-item">
                <a href={sponsor.linkUrl} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={sponsor.imageUrl} 
                    alt={sponsor.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/sponsors/placeholder.png';
                    }}
                  />
                  <span className="sponsor-name">{sponsor.name}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card message-card">
          <h2 className="section-title">運営メッセージ</h2>
          <p>
            新潟のクラフトビールを愛するすべての人へ。<br />
            このマップが、あなたの「新しい一杯」との出会いのきっかけになれば幸いです。<br />
            みんなで新潟のクラフトビール文化を盛り上げていきましょう！
          </p>
        </div>

        {config.form_url ? (
          <div className="content-card">
            <h2 className="section-title">掲載・データ更新について</h2>
            <p>掲載情報の追加・修正をご希望の方は、下の「 + 」ボタンからフォームにご入力ください。</p>
            <div className="goto-form">
              <button onClick={clickHandler}>
                <FaPlus color="#FFFFFF" />
              </button>
            </div>
          </div>
        ) : null}

        {showVersionInfo && (
          <div className="version-modal-overlay" onClick={() => setShowVersionInfo(false)}>
            <div className="version-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="version-modal-header">
                <h2 className="section-title">
                  <FaInfoCircle className="section-icon" />
                  アプリ情報
                </h2>
                <button 
                  className="version-modal-close" 
                  onClick={() => setShowVersionInfo(false)}
                  aria-label="閉じる"
                >
                  ×
                </button>
              </div>
              <div className="version-details">
                <div className="version-item">
                  <span className="version-label">現在のバージョン:</span>
                  <span className="version-value">{getVersionDisplayString()}</span>
                </div>
                <div className="version-item">
                  <span className="version-label">詳細情報:</span>
                  <span className="version-value">{getDetailedVersionString()}</span>
                </div>
                <div className="version-item">
                  <span className="version-label">インストール済み:</span>
                  <span className="version-value">{getStoredVersion() || 'なし'}</span>
                </div>
              </div>
              <p className="version-note">
                アプリが更新された場合、自動的にキャッシュがクリアされ最新版が適用されます。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;