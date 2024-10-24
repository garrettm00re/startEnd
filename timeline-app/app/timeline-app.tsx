import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Timeline } from '@/components/timeline/Timeline';
import { TaskDialog } from '@/components/timeline/TaskDialog';
import { DayData, Tag, Task } from '@/lib/types';
import { NewTagDialog } from '@/components/timeline/NewTagDialog';
import { saveDayData, loadDayData, saveTags, loadTags } from '@/lib/storage';

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
    setTags(loadTags());

    const today = new Date().toISOString().split('T')[0];
    const storedDayData = loadDayData(today);
    if (storedDayData && !storedDayData.dayEndTime) {
      setDayData(storedDayData);
      setCurrentTask(storedDayData.tasks[storedDayData.tasks.length - 1] || null);
    }
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
  }, []);

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
  }, [dayData]);

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
  }, [dayData, currentTask, editingTask, taskTitle, taskDescription, selectedTagId]);

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
  }, [newTagName, newTagColor]);

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
        {dayData && (
          <Timeline
            tasks={dayData.tasks}
            tags={tags}
            onTaskClick={handleTaskClick}
            calculateTaskHeight={calculateTaskHeight}
            currentTime={currentTime}
          />
        )}
      </div>
      <div className="p-4 flex justify-center">
        <Button onClick={() => setIsDialogOpen(true)} disabled={!dayData}>
          Start/End Task
        </Button>
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingTask={editingTask}
        currentTask={currentTask}
        taskTitle={taskTitle}
        setTaskTitle={setTaskTitle}
        taskDescription={taskDescription}
        setTaskDescription={setTaskDescription}
        selectedTagId={selectedTagId}
        setSelectedTagId={setSelectedTagId}
        tags={tags}
        tagSearchTerm={tagSearchTerm}
        setTagSearchTerm={setTagSearchTerm}
        onCreateNewTag={() => setIsNewTagDialogOpen(true)}
        onDone={handleDialogClose}
      />

      <NewTagDialog
        open={isNewTagDialogOpen}
        onOpenChange={setIsNewTagDialogOpen}
        newTagName={newTagName}
        setNewTagName={setNewTagName}
        newTagColor={newTagColor}
        setNewTagColor={setNewTagColor}
        onCreateTag={handleNewTag}
      />
    </div>
  );
};

export default TimelineApp;