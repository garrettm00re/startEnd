import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  const [isNewTagDialogOpen, setIsNewTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#000000');
  const [tagSearchTerm, setTagSearchTerm] = useState('');

  const saveDayData = useCallback((data: DayData) => {
    localStorage.setItem(data.date, JSON.stringify(data));
  }, []);

  const loadDayData = useCallback((date: string): DayData | null => {
    const data = localStorage.getItem(date);
    return data ? JSON.parse(data) : null;
  }, []);

  const saveTags = useCallback((tagsData: Tag[]) => {
    localStorage.setItem('tags', JSON.stringify(tagsData));
  }, []);

  const loadTags = useCallback((): Tag[] => {
    const tagsData = localStorage.getItem('tags');
    return tagsData ? JSON.parse(tagsData) : [];
  }, []);

  useEffect(() => {
    setTags(loadTags());
  }, [loadTags]);

  const startDay = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const newDayData: DayData = {
      date: today,
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

  const startEndTask = useCallback(() => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setSelectedTagId(null);
    setIsDialogOpen(true);
  }, []);

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
      // Editing existing task
      updatedDayData = {
        ...dayData,
        tasks: dayData.tasks.map(task => 
          task.id === editingTask.id 
            ? { ...task, title: taskTitle, description: taskDescription, tagId: selectedTagId }
            : task
        ),
      };
    } else {
      // Creating new task
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 500); // Update every 2000ms (this is the refresh rate)
  
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const loadedData = loadDayData(today);
    if (loadedData && !loadedData.dayEndTime) {
      setDayData(loadedData);
      setCurrentTask(loadedData.tasks[loadedData.tasks.length - 1] || null);
    }
  }, [loadDayData]);

  const calculateTaskHeight = useCallback((task: Task) => {
    if (!dayData) return '90%';
    const startTime = new Date(dayData.dayStartTime).getTime();
    const endTime = (dayData.dayEndTime ? new Date(dayData.dayEndTime) : currentTime).getTime();
    const totalDuration = endTime - startTime;
    const taskStartTime = new Date(task.startTime).getTime();
    const taskEndTime = (task.endTime ? new Date(task.endTime) : currentTime).getTime();
    const taskDuration = taskEndTime - taskStartTime;
    return `${5 + (taskDuration / totalDuration) * 100}%`;
    //return `${Math.max(5, (taskDuration / totalDuration) * 100)}%`;
  }, [dayData, currentTime]);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, []);

  const Timestep = React.memo(({ time }: { time: string }) => (
    <div className="w-full flex items-center justify-center bg-black text-white text-xs px-1">
      {formatTime(time)}
    </div>
  ));
  Timestep.displayName = 'Timestep';

  const TaskItem = React.memo(({ task, index, showBottomTimestep }: { task: Task; index: number; showBottomTimestep: boolean }) => {
    const tag = tags.find(t => t.id === task.tagId);
    const height = calculateTaskHeight(task);
    
    return (
      <>
        {index === 0 && <Timestep time={task.startTime} />}
        <div
          className="text-white flex justify-center items-center w-full cursor-pointer hover:opacity-80"
          style={{ height, backgroundColor: tag?.color || '#000000' }}
          onClick={() => handleTaskClick(task)}
        >
          <div className="font-bold z-10">{task.title}</div>
        </div>
        {(showBottomTimestep || task.endTime) && <Timestep time={task.endTime || currentTime.toISOString()} />}
      </>
    );
  }, (prevProps, nextProps) => {
    return prevProps.task === nextProps.task && 
           prevProps.index === nextProps.index && 
           prevProps.showBottomTimestep === nextProps.showBottomTimestep;
  });
  TaskItem.displayName = 'TaskItem';

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
          {dayData && dayData.tasks.map((task, index) => (
            <TaskItem 
              key={task.id}
              task={task}
              index={index}
              showBottomTimestep={index === dayData.tasks.length - 1}
            />
          ))}
        </div>
      </div>
      <div className="p-4 flex justify-center">
        <Button onClick={startEndTask} disabled={!dayData}>
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

//export default TimelineApp;