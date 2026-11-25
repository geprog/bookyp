import dayjs from 'dayjs';

/** rounds a date up to the next multiple of `minutes` */
export function ceilToMinutes(date: Date | string, minutes: number): Date {
  const d = dayjs(date);
  return d
    .add(minutes - (d.minute() % minutes), 'minute')
    .startOf('minute')
    .toDate();
}

export function overlaps(a: { start: Date | string; end: Date | string }, b: { start: Date | string; end: Date | string }): boolean {
  return new Date(a.start) < new Date(b.end) && new Date(a.end) > new Date(b.start);
}
