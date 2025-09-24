/** 
 * /src/App/Tabbar.tsx
 * 2025-01-14T15:30+09:00
 * 変更概要: 要件定義書に沿ったタブ構成に修正（ダッシュボード|地図|リスト|カレンダー|情報）
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Tabbar.scss';
import { FiHome, FiMap, FiList, FiCalendar, FiInfo } from 'react-icons/fi';

const Content: React.FC = () => {
  const location = useLocation();

  return (
    <div className="tabbar">
      <Link 
        to="/" 
        className={location.pathname === '/' ? 'active' : ''}
      >
        <FiHome />
        <span>ダッシュボード</span>
      </Link>
      <Link 
        to="/map" 
        className={location.pathname === '/map' ? 'active' : ''}
      >
        <FiMap />
        <span>地図</span>
      </Link>
      <Link 
        to="/list" 
        className={location.pathname === '/list' ? 'active' : ''}
      >
        <FiList />
        <span>リスト</span>
      </Link>
      <Link 
        to="/calendar" 
        className={location.pathname === '/calendar' ? 'active' : ''}
      >
        <FiCalendar />
        <span>カレンダー</span>
      </Link>
      <Link 
        to="/info" 
        className={location.pathname === '/info' ? 'active' : ''}
      >
        <FiInfo />
        <span>情報</span>
      </Link>
    </div>
  );
};

export default Content;
