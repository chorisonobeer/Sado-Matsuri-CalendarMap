/** 
 * /src/lib/csv.ts
 * 2025-09-17T00:00+09:00
 * 変更概要: ヘッダ名基準のCSVパース共通ユーティリティを新規追加（列順非依存）
 */

import * as Papa from 'papaparse';

export interface CsvParseOptions<T> {
  requiredFields?: string[];
  transform?: (record: Record<string, any>, index: number) => T | null;
}

export function parseCsvByHeader<T>(
  csvData: string,
  options: CsvParseOptions<T> = {}
): T[] {
  const { requiredFields = [], transform } = options;
  
  const parseResult = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  });
  
  if (parseResult.errors.length > 0) {
    throw new Error(`CSV解析エラー: ${parseResult.errors[0].message}`);
  }
  
  const results: T[] = [];
  const data = parseResult.data as Record<string, any>[];
  
  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    
    // 必須フィールドチェック
    const missingFields = requiredFields.filter(field => !record[field]);
    if (missingFields.length > 0) {
      continue; // 必須フィールドが不足している行はスキップ
    }
    
    // transform関数が提供されている場合は使用
    if (transform) {
      const transformed = transform(record, i);
      if (transformed !== null) {
        results.push(transformed);
      }
    } else {
      results.push(record as T);
    }
  }
  
  return results;
}

export function stripWrappingQuotes(str: string): string {
  if (!str || typeof str !== 'string') return str;
  
  const trimmed = str.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('`') && trimmed.endsWith('`'))) {
    return trimmed.substring(1, trimmed.length - 1);
  }
  
  return trimmed;
}

export default parseCsvByHeader;