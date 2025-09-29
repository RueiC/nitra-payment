import { DEFAULT_DECIMAL_PLACES } from '@/constant';
import Decimal from 'decimal.js';

export function formatCurrency(cents: number): string {
  const numericCents = new Decimal(Number(cents) || 0);

  // 判斷 cents 是否為 100 的倍數（使用絕對值以支援負數）
  // const isWholeNumber = numericCents.mod(100).abs().equals(0);

  // 將 cents 轉為 dollars 字串，使用 toFixed 確保正確的位數
  // const fractionDigits = isWholeNumber ? 0 : 2;
  const fractionDigits = 2;
  const amountInDollarsStr = numericCents
    .dividedBy(100)
    .toDecimalPlaces(DEFAULT_DECIMAL_PLACES, Decimal.ROUND_DOWN)
    .toString();

  // 交給 Intl.NumberFormat 處理地區與貨幣格式化
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(parseFloat(amountInDollarsStr));
}
