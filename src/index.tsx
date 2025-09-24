import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from "react-router-dom";
import Container from './Container';
import './index.scss'
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// アプリ終了時にイベントキャッシュを削除
window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('eventListCache');
});

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Container />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// Service Worker登録時に更新があれば即座に適用
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // 新しいService Workerが利用可能になったら即座に更新
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
  onSuccess: (_registration) => {
    console.log('Service Worker registered successfully');
  }
});
