const LOCALES = {
  fr: 'fr-TN',
  en: 'en-TN',
  it: 'it-TN',
  ar: 'ar-TN',
};

export const formatDT = (amount, lang = 'fr') => {
  const locale = LOCALES[lang] || 'fr-TN';
  const value = Number(amount) || 0;
  return (
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(value) + ' DT'
  );
};

export const parseDT = (str) => {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
};

function inTimeWindow(start, end) {
  if (!start || !end) return false;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  // Handles overnight windows (e.g. 22:00 → 02:00)
  return startMins <= endMins
    ? nowMins >= startMins && nowMins < endMins
    : nowMins >= startMins || nowMins < endMins;
}

// Returns the price that applies right now: promo > happy hour > base
export function getEffectivePrice(item) {
  if (isPromoActive(item)) return parseFloat(item.promo_price);
  const happyHourPrice = parseFloat(item.price_happy_hour);
  if (happyHourPrice > 0 && inTimeWindow(item.happy_hour_start, item.happy_hour_end)) {
    return happyHourPrice;
  }
  return parseFloat(item.price) || 0;
}

// True when the item is currently in happy hour
export function isHappyHour(item) {
  return (
    parseFloat(item.price_happy_hour) > 0 &&
    inTimeWindow(item.happy_hour_start, item.happy_hour_end)
  );
}

// True when a promo is active today (no dates = always active)
export function isPromoActive(item) {
  if (!item.promo_price || parseFloat(item.promo_price) <= 0) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (item.promo_start) {
    const start = new Date(item.promo_start);
    start.setHours(0, 0, 0, 0);
    if (today < start) return false;
  }
  if (item.promo_end) {
    const end = new Date(item.promo_end);
    end.setHours(0, 0, 0, 0);
    if (today > end) return false;
  }
  return true;
}
