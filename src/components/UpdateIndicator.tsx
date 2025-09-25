import React from 'react';
import './UpdateIndicator.scss';

interface UpdateIndicatorProps {
  isChecking: boolean;
  updateApplied: boolean;
}

export const UpdateIndicator: React.FC<UpdateIndicatorProps> = ({
  isChecking,
  updateApplied
}) => {
  if (!isChecking && !updateApplied) {
    return null;
  }

  return (
    <div className="update-indicator">
      <div className="update-content">
        {updateApplied ? (
          <>
            <div className="update-icon">✅</div>
            <span className="update-text">更新完了</span>
          </>
        ) : (
          <>
            <div className="update-spinner"></div>
            <span className="update-text">最新版をチェック中...</span>
          </>
        )}
      </div>
    </div>
  );
};
