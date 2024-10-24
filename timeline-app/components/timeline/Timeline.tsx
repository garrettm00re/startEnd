// components/Timeline.tsx
import React from 'react';
import { TaskItem } from './TaskItem';
import { Timestep } from './Timestep';
import { Tag, Task } from '../../lib/types';

interface TimelineProps {
  tasks: Task[];
  tags: Tag[];
  onTaskClick: (task: Task) => void;
  calculateTaskHeight: (task: Task) => string;
  currentTime: Date;
}

export const Timeline: React.FC<TimelineProps> = React.memo(({
  tasks,
  tags,
  onTaskClick,
  calculateTaskHeight,
  currentTime,
}) => (
  <div className="h-full flex flex-col items-stretch relative w-full">
    {tasks.map((task, index) => (
      <React.Fragment key={task.id}>
        {index === 0 && <Timestep time={task.startTime} />}
        <TaskItem
          task={task}
          tag={tags.find(t => t.id === task.tagId)}
          height={calculateTaskHeight(task)}
          onClick={() => onTaskClick(task)}
        />
        {(index === tasks.length - 1 || task.endTime) && 
          <Timestep time={task.endTime || currentTime.toISOString()} />
        }
      </React.Fragment>
    ))}
  </div>
));

Timeline.displayName = 'Timeline';