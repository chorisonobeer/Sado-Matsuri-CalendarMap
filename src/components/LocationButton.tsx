/**
 * /src/components/LocationButton.tsx
 * 現在地取得・移動ボタンコンポーネント
 */

import React, { useContext } from 'react';
import { FiNavigation, FiLoader } from 'react-icons/fi';
import { GeolocationContext } from '../context/GeolocationContext';
import './LocationButton.scss';

interface LocationButtonProps {
  onLocationFound?: (location: [number, number]) => void;
  className?: string;
}

const LocationButton: React.FC<LocationButtonProps> = ({ 
  onLocationFound, 
  className = '' 
}) => {
  const { location, isLoading, error, refreshLocation } = useContext(GeolocationContext);

  const handleLocationClick = async () => {
    try {
      await refreshLocation();
      if (location && onLocationFound) {
        onLocationFound(location);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  return (
    <button
      className={`location-button ${className} ${isLoading ? 'loading' : ''} ${error ? 'error' : ''}`}
      onClick={handleLocationClick}
      disabled={isLoading}
      title={error ? '位置情報の取得に失敗しました' : '現在地を取得'}
    >
      {isLoading ? (
        <FiLoader className="icon spinning" />
      ) : (
        <FiNavigation className="icon" />
      )}
      <span className="text">
        {isLoading ? '取得中...' : '現在地'}
      </span>
    </button>
  );
};

export default LocationButton;
