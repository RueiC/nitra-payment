/**
 * Check if a field is required
 *
 * @param {string} val - Field value
 * @returns {true|string} Returns true when valid, otherwise returns an error message ('此欄位為必填')
 */
const isRequired = (val: string) => !!val || '此欄位為必填';

/**
 * Validate that a card number length is 16 digits (whitespace is removed before checking)
 *
 * - Only checks length; does not perform Luhn check or card brand validation.
 *
 * @param {string} val - Card number string (may include spaces)
 * @returns {true|string} Returns true when valid, otherwise returns an error message ('請輸入 16 位有效的卡號')
 */
const isValidCardNumber = (val: string) =>
  (val && val.replace(/\s/g, '').length === 16) || '請輸入 16 位有效的卡號';

/**
 * Validate expiration date is in MM/YY format and not expired
 *
 * - Format: two-digit month + '/' + two-digit year, e.g. "09/25".
 * - Validity: month must be between 1 and 12; year is compared against the current year's last two digits.
 *   If the year is the same as current, compare months to determine expiry.
 *
 * @param {string} val - Expiration date string in MM/YY
 * @returns {true|string} Returns true when valid, otherwise returns a corresponding error message ('請輸入 MM/YY 格式' / '月份無效' / '信用卡已過期')
 */
const isValidExpirationDate = (val: string) => {
  if (!/^\d{2}\/\d{2}$/.test(val)) {
    return '請輸入 MM/YY 格式';
  }

  const parts = val.split('/');
  const month = Number(parts[0]);
  const year = Number(parts[1]);

  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  if (month < 1 || month > 12) {
    return '月份無效';
  }

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return '信用卡已過期';
  }

  return true;
};

/**
 * Validate CVC/CVV is 3 digits
 *
 * @param {string} val - CVC string
 * @returns {true|string} Returns true when valid, otherwise returns an error message ('請輸入 3 位 CVC')
 */
const isValidCvc = (val: string) =>
  (val && val.length === 3) || '請輸入 3 位 CVC';

export { isRequired, isValidCardNumber, isValidExpirationDate, isValidCvc };
