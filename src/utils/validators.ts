const isRequired = (val: string) => !!val || '此欄位為必填';

const isValidCardNumber = (val: string) =>
  (val && val.replace(/\s/g, '').length === 16) || '請輸入 16 位有效的卡號';

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

const isValidCvc = (val: string) =>
  (val && val.length === 3) || '請輸入 3 位 CVC';

export { isRequired, isValidCardNumber, isValidExpirationDate, isValidCvc };
