/**
 * @file YAML 形式の設定ファイルをパースし 環境変数として react-scripts に読み込ませる
 */

const fs = require("fs");
const YAML = require("yaml");
const path = require("path")

const srcConfigFilePath = path.join(process.cwd(), "/config.yml");
const distConfigFilePath = path.join(process.cwd(), "/src/config.json");
const envFilePath = path.join(process.cwd(), '.env');

let yamlText;
try {
  yamlText = fs.readFileSync(srcConfigFilePath).toString();
} catch (error) {
  process.stderr.write(`${srcConfigFilePath} が存在しません。\n`);
  process.exit(1);
}

let config;
try {
  config = YAML.parse(yamlText);
} catch (error) {
  process.stderr.write(
    `${srcConfigFilePath} は正しい YAML 形式である必要があります。\n`
  );
  process.exit(2);
}

if (!config) {
  process.stderr.write(
    `${srcConfigFilePath} は正しい YAML 形式である必要があります。\n`
  );
  process.exit(3);
}

// 環境変数からGoogle Maps APIキーを取得
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

// 既存の.envファイルを読み込み、Google Maps APIキーのみを更新
let existingEnvContent = '';
try {
  existingEnvContent = fs.readFileSync(envFilePath, 'utf8');
} catch (error) {
  // .envファイルが存在しない場合は新規作成
}

// 既存の環境変数を解析
const existingEnvVars = {};
existingEnvContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      existingEnvVars[key.trim()] = valueParts.join('=').replace(/^"(.*)"$/, '$1');
    }
  }
});

// config.ymlからの環境変数を生成
const configEnvVars = {};
Object.keys(config)
  .filter((key) => typeof config[key] === "string" || typeof config[key] === "number")
  .forEach((key) => {
    configEnvVars[`REACT_APP_${key.toUpperCase()}`] = config[key];
  });

// Google Maps APIキーを環境変数から設定（優先）
if (googleMapsApiKey) {
  configEnvVars['REACT_APP_GOOGLE_MAPS_API_KEY'] = googleMapsApiKey;
}

// 既存の環境変数と新しい設定をマージ（新しい設定が優先）
const mergedEnvVars = { ...existingEnvVars, ...configEnvVars };

// .envファイルの内容を生成
const envText = Object.keys(mergedEnvVars)
  .map(key => `${key}="${mergedEnvVars[key]}"`)
  .join('\n') + '\n';

// src/config.jsonを生成（APIキーは含めない）
fs.writeFileSync(distConfigFilePath, JSON.stringify(config, null, 2));

// .envファイルを更新
fs.writeFileSync(envFilePath, envText);

process.exit(0);
