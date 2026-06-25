export const getTodayString = (): string => new Date().toISOString().split('T')[0];

export const formatDate = (dateStr?: string): string => {
  const date = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

export const getLast35Days = (): string[] => {
  const days: string[] = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

export const formatShortDay = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
};
