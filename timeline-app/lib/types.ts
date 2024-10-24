// types.ts
export interface Tag {
    id: string;
    name: string;
    color: string;
  }
  
  export interface Task {
    id: string;
    title: string;
    description: string;
    tagId: string;
    startTime: string;
    endTime: string | null;
  }
  
  export interface DayData {
    date: string;
    tasks: Task[];
    dayStartTime: string;
    dayEndTime: string | null;
  }