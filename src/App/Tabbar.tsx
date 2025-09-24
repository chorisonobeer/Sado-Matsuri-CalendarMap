/** 
 * /src/App/Tabbar.tsx
 * 2025-01-14T15:30+09:00
 * 変更概要: 要件定義書に沿ったタブ構成に修正（ダッシュボード|地図|リスト|カレンダー|情報）
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiMap, FiList, FiCalendar, FiInfo } from 'react-icons/fi';
import './Tabbar.scss';

const Tabbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="tabbar">
      <ul>
        <li>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            <FiHome className="icon" />
            <span className="text">ダッシュボード</span>
          </Link>
        </li>
        
        <li>
          <Link 
            to="/map" 
            className={location.pathname === '/map' ? 'active' : ''}
          >
            <FiMap className="icon" />
            <span className="text">地図</span>
          </Link>
        </li>
        
        <li>
          <Link 
            to="/list" 
            className={location.pathname === '/list' ? 'active' : ''}
          >
            <FiList className="icon" />
            <span className="text">リスト</span>
          </Link>
        </li>
        
        <li>
          <Link 
            to="/calendar" 
            className={location.pathname === '/calendar' ? 'active' : ''}
          >
            <FiCalendar className="icon" />
            <span className="text">カレンダー</span>
          </Link>
        </li>
        
        <li>
          <Link 
            to="/info" 
            className={location.pathname === '/info' ? 'active' : ''}
          >
            <FiInfo className="icon" />
            <span className="text">情報</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Tabbar;
