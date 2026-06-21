export const NO_DEADLINE = "2099-12-31";

export const normalizeDateKey = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  }

  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d] = value;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  if (typeof value === "number") {
    return normalizeDateKey(new Date(value));
  }

  return null;
};

export const parseDateKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

export const getOpportunityEndKey = (closingDate) => {
  const closingKey = normalizeDateKey(closingDate);
  if (!closingKey || closingKey === NO_DEADLINE) return NO_DEADLINE;
  return closingKey;
};

export const dayHasOpportunity = (dayKey, opportunity) => {
  const startKey = normalizeDateKey(opportunity.openingDate);
  if (!startKey || !dayKey) return false;

  const endKey = getOpportunityEndKey(opportunity.closingDate);
  return startKey <= dayKey && dayKey <= endKey;
};

export const countOpportunitiesOnDay = (dayKey, opportunities) => {
  if (!dayKey || !Array.isArray(opportunities)) return 0;
  return opportunities.reduce(
    (count, opportunity) => count + (dayHasOpportunity(dayKey, opportunity) ? 1 : 0),
    0
  );
};

export const opportunityMatchesDateRange = (opportunity, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return true;

  const oppStart = normalizeDateKey(opportunity.openingDate);
  if (!oppStart) return false;

  const oppEnd = getOpportunityEndKey(opportunity.closingDate);
  const filterStart = dateFrom || dateTo;
  const filterEnd = dateTo || dateFrom;

  return oppStart <= filterEnd && oppEnd >= filterStart;
};

export const buildCalendarMonthDays = (viewDate) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const days = [];

  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const y = year;
    const m = String(month + 1).padStart(2, "0");
    const day = String(d).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }

  return days;
};

export const todayDateKey = () => normalizeDateKey(new Date());
