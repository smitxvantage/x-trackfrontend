import { create } from 'zustand';

export type HolidayType = 'Public' | 'Optional' | 'Company Event';

export interface Holiday {
  id: string;
  title: string;
  date: Date;
  type: HolidayType;
}

export interface LeaveEvent {
  id: string;
  employeeName: string;
  startDate: Date;
  endDate: Date;
  type: string;
  status: 'Approved' | 'Pending';
}

interface CalendarState {
  holidays: Holiday[];
  leaves: LeaveEvent[];
  addHoliday: (holiday: Holiday) => void;
  setHolidays: (holidays: Holiday[]) => void;
  setLeaves: (leaves: LeaveEvent[]) => void;
  removeHoliday: (id: string) => void;
  updateHoliday: (id: string, holiday: Partial<Holiday>) => void;
}

// Mock Data
const initialHolidays: Holiday[] = [
  { id: '1', title: 'New Year', date: new Date(new Date().getFullYear(), 0, 1), type: 'Public' },
  { id: '2', title: 'Thanksgiving', date: new Date(new Date().getFullYear(), 10, 23), type: 'Public' },
  { id: '3', title: 'Christmas', date: new Date(new Date().getFullYear(), 11, 25), type: 'Public' },
  { id: '4', title: 'Office Party', date: new Date(new Date().getFullYear(), 11, 20), type: 'Company Event' },
];

const initialLeaves: LeaveEvent[] = [
  { id: '1', employeeName: 'Sarah Johnson', startDate: new Date(new Date().getFullYear(), 10, 5), endDate: new Date(new Date().getFullYear(), 10, 7), type: 'Sick', status: 'Approved' },
  { id: '2', employeeName: 'Mike Chen', startDate: new Date(new Date().getFullYear(), 10, 12), endDate: new Date(new Date().getFullYear(), 10, 12), type: 'Personal', status: 'Approved' },
];

export const useCalendarStore = create<CalendarState>((set) => ({
  holidays: initialHolidays,
  leaves: initialLeaves,
  setHolidays: (holidays) => set({ holidays }),
  setLeaves: (leaves) => set({ leaves }),
  addHoliday: (holiday) => set((state) => ({ holidays: [...state.holidays, holiday] })),
  removeHoliday: (id) => set((state) => ({ holidays: state.holidays.filter((h) => h.id !== id) })),
  updateHoliday: (id, updated) => set((state) => ({
    holidays: state.holidays.map((h) => (h.id === id ? { ...h, ...updated } : h)),
  })),
}));
