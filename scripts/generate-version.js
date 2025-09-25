const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

try {
  // Git情報を取得
  const buildId = execSync('git rev-parse --short HEAD').toString().trim();
  const buildTime = new Date().toISOString();
  
  // バージョン情報を作成
  const version = {
    timestamp: buildTime,
    buildId: buildId,
    buildTime: Date.now(),
    version: `${buildTime.split('T')[0]}-${buildId}`
  };

  // public/version.jsonに書き出し
  const publicDir = path.join(__dirname, '..', 'public');
  const versionPath = path.join(publicDir, 'version.json');
  
  // publicディレクトリが存在することを確認
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(versionPath, JSON.stringify(version, null, 2));
  
  console.log('✅ Version file generated:', version);
  console.log('📁 File location:', versionPath);
  
} catch (error) {
  console.error('❌ Failed to generate version file:', error);
  
  // フォールバック: Git情報が取得できない場合
  const fallbackVersion = {
    timestamp: new Date().toISOString(),
    buildId: 'unknown',
    buildTime: Date.now(),
    version: `${new Date().toISOString().split('T')[0]}-unknown`
  };
  
  const publicDir = path.join(__dirname, '..', 'public');
  const versionPath = path.join(publicDir, 'version.json');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(versionPath, JSON.stringify(fallbackVersion, null, 2));
  console.log('⚠️ Fallback version file generated:', fallbackVersion);
}
