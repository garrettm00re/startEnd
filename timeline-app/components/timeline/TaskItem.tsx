// components/TaskItem.tsx
import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Tag, Task } from '../../lib/types';

interface TaskItemProps {
  task: Task;
  tag: Tag | undefined;
  height: string;
  onClick: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = React.memo(({ task, tag, height, onClick }) => {
  const controls = useAnimation();

  React.useEffect(() => {
    controls.start({ height });
  }, [height, controls]);

  return (
    <motion.div
      animate={controls}
      className="w-full flex items-center justify-center cursor-pointer hover:opacity-80"
      style={{ backgroundColor: tag?.color || '#000000' }}
      onClick={onClick}
    >
      <div className="font-bold text-white z-10">{task.title}</div>
    </motion.div>
  );
});

TaskItem.displayName = 'TaskItem';