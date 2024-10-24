// storage.ts
import { DayData, Tag } from './types';

export const saveDayData = (data: DayData) => {
  localStorage.setItem(data.date, JSON.stringify(data));
};

export const loadDayData = (date: string): DayData | null => {
  const data = localStorage.getItem(date);
  return data ? JSON.parse(data) : null;
};

export const saveTags = (tags: Tag[]) => {
  localStorage.setItem('tags', JSON.stringify(tags));
};

export const loadTags = (): Tag[] => {
  const tagsData = localStorage.getItem('tags');
  return tagsData ? JSON.parse(tagsData) : [];
};
