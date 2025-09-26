/** 
 * /src/App/Tabbar.tsx
 * 2025-01-25T10:00+09:00
 * 変更概要: 「地図」「リスト」タブを削除し「検索」タブに統合（ダッシュボード|検索|カレンダー|情報）
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiCalendar, FiInfo } from 'react-icons/fi';
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
            <span className="text">ホーム</span>
          </Link>
        </li>
        
        <li>
          <Link 
            to="/search" 
            className={location.pathname === '/search' ? 'active' : ''}
          >
            <FiSearch className="icon" />
            <span className="text">検索</span>
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
