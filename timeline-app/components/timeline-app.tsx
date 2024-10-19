import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  tagId: string;
  startTime: string;
  endTime: string | null;
}

interface DayData {
  date: string;
  tasks: Task[];
  dayStartTime: string;
  dayEndTime: string | null;
}

interface TaskItemProps {
  task: Task;
  tag: Tag | undefined;
  height: string;
  onClick: () => void;
}

const Timestep: React.FC<{ time: string }> = React.memo(({ time }) => (
  <div className="w-full flex items-center justify-center bg-black text-white text-xs px-1">
    {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
  </div>
));
Timestep.displayName = 'Timestep';

const TaskItem: React.FC<TaskItemProps> = React.memo(({ task, tag, height, onClick }) => {
  const controls = useAnimation();

  useEffect(() => {
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

export const TimelineApp: React.FC = () => {
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [isNewTagDialogOpen, setIsNewTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#000000');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load tags from localStorage
    const storedTags = localStorage.getItem('tags');
    if (storedTags) {
      setTags(JSON.parse(storedTags));
    }

    // Load current day data from localStorage
    const today = new Date().toISOString().split('T')[0];
    const storedDayData = localStorage.getItem(today);
    if (storedDayData) {
      const parsedDayData = JSON.parse(storedDayData);
      if (!parsedDayData.dayEndTime) {
        setDayData(parsedDayData);
        setCurrentTask(parsedDayData.tasks[parsedDayData.tasks.length - 1] || null);
      }
    }
  }, []);

  const saveDayData = useCallback((data: DayData) => {
    localStorage.setItem(data.date, JSON.stringify(data));
  }, []);

  const saveTags = useCallback((tagsData: Tag[]) => {
    localStorage.setItem('tags', JSON.stringify(tagsData));
  }, []);

  const startDay = useCallback(() => {
    const newDayData: DayData = {
      date: new Date().toISOString().split('T')[0],
      tasks: [],
      dayStartTime: new Date().toISOString(),
      dayEndTime: null,
    };
    setDayData(newDayData);
    saveDayData(newDayData);
    setIsDialogOpen(true);
  }, [saveDayData]);

  const endDay = useCallback(() => {
    if (dayData) {
      const endedDayData: DayData = {
        ...dayData,
        dayEndTime: new Date().toISOString(),
        tasks: dayData.tasks.map(task => 
          task.endTime ? task : { ...task, endTime: new Date().toISOString() }
        ),
      };
      setDayData(null);
      saveDayData(endedDayData);
      setCurrentTask(null);
    }
  }, [dayData, saveDayData]);

  const handleTaskClick = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setSelectedTagId(task.tagId);
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    if (!dayData || !selectedTagId) return;

    let updatedDayData: DayData;

    if (editingTask) {
      updatedDayData = {
        ...dayData,
        tasks: dayData.tasks.map(task => 
          task.id === editingTask.id 
            ? { ...task, title: taskTitle, description: taskDescription, tagId: selectedTagId }
            : task
        ),
      };
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskTitle,
        description: taskDescription,
        tagId: selectedTagId,
        startTime: new Date().toISOString(),
        endTime: null,
      };

      updatedDayData = {
        ...dayData,
        tasks: currentTask
          ? [...dayData.tasks.slice(0, -1), 
             { ...dayData.tasks[dayData.tasks.length - 1], endTime: new Date().toISOString() },
             newTask]
          : [...dayData.tasks, newTask],
      };

      setCurrentTask(newTask);
    }

    setDayData(updatedDayData);
    saveDayData(updatedDayData);
    setTaskTitle('');
    setTaskDescription('');
    setSelectedTagId(null);
    setEditingTask(null);
    setIsDialogOpen(false);
  }, [dayData, currentTask, editingTask, taskTitle, taskDescription, selectedTagId, saveDayData]);

  const handleNewTag = useCallback(() => {
    const newTag: Tag = {
      id: Date.now().toString(),
      name: newTagName,
      color: newTagColor,
    };
    setTags(prevTags => {
      const updatedTags = [...prevTags, newTag];
      saveTags(updatedTags);
      return updatedTags;
    });
    setSelectedTagId(newTag.id);
    setNewTagName('');
    setNewTagColor('#000000');
    setIsNewTagDialogOpen(false);
  }, [newTagName, newTagColor, saveTags]);

  const calculateTaskHeight = useCallback((task: Task) => {
    if (!dayData) return '0%';
    const startTime = new Date(dayData.dayStartTime).getTime();
    const endTime = (dayData.dayEndTime ? new Date(dayData.dayEndTime) : currentTime).getTime();
    const totalDuration = endTime - startTime;
    const taskStartTime = new Date(task.startTime).getTime();
    const taskEndTime = (task.endTime ? new Date(task.endTime) : currentTime).getTime();
    const taskDuration = taskEndTime - taskStartTime;
    return `${Math.max(5, (taskDuration / totalDuration) * 100)}%`;
  }, [dayData, currentTime]);

  const filteredTags = useMemo(() => {
    return tags.filter(tag => tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()));
  }, [tags, tagSearchTerm]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          {!dayData ? (
            <Button onClick={startDay}>Start Day</Button>
          ) : (
            <Button onClick={endDay}>End Day</Button>
          )}
        </div>
        <div className="h-full flex flex-col items-stretch relative w-full">
          {dayData?.tasks.map((task, index) => (
            <React.Fragment key={task.id}>
              {index === 0 && <Timestep time={task.startTime} />}
              <TaskItem
                task={task}
                tag={tags.find(t => t.id === task.tagId)}
                height={calculateTaskHeight(task)}
                onClick={() => handleTaskClick(task)}
              />
              {(index === dayData.tasks.length - 1 || task.endTime) && 
                <Timestep time={task.endTime || currentTime.toISOString()} />
              }
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="p-4 flex justify-center">
        <Button onClick={() => setIsDialogOpen(true)} disabled={!dayData}>
          Start/End Task
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : currentTask ? 'Start New Task' : 'Start First Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Task Title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <Input
              placeholder="Task Description (optional)"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {selectedTagId ? tags.find(tag => tag.id === selectedTagId)?.name : "Select tag"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2">
                <Input
                  placeholder="Search tags..."
                  value={tagSearchTerm}
                  onChange={(e) => setTagSearchTerm(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-[200px] overflow-y-auto">
                  {filteredTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedTagId(tag.id)}
                    >
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: tag.color }}></div>
                      {tag.name}
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-2" onClick={() => setIsNewTagDialogOpen(true)}>Create New Tag</Button>
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewTagDialogOpen} onOpenChange={setIsNewTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Tag Name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tag Color</label>
              <div className="border-2 border-gray-300 rounded-md p-2">
                <Input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-full h-32"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleNewTag}>Create Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimelineApp;