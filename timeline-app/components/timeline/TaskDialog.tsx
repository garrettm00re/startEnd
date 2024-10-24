// components/TaskDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tag, Task } from '../../lib/types';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask: Task | null;
  currentTask: Task | null;
  taskTitle: string;
  setTaskTitle: (title: string) => void;
  taskDescription: string;
  setTaskDescription: (desc: string) => void;
  selectedTagId: string | null;
  setSelectedTagId: (id: string) => void;
  tags: Tag[];
  tagSearchTerm: string;
  setTagSearchTerm: (term: string) => void;
  onCreateNewTag: () => void;
  onDone: () => void;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onOpenChange,
  editingTask,
  currentTask,
  taskTitle,
  setTaskTitle,
  taskDescription,
  setTaskDescription,
  selectedTagId,
  setSelectedTagId,
  tags,
  tagSearchTerm,
  setTagSearchTerm,
  onCreateNewTag,
  onDone,
}) => {
  const filteredTags = React.useMemo(() => {
    return tags.filter(tag => tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()));
  }, [tags, tagSearchTerm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingTask ? 'Edit Task' : currentTask ? 'Start New Task' : 'Start First Task'}
          </DialogTitle>
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
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </div>
                ))}
              </div>
              <Button className="w-full mt-2" onClick={onCreateNewTag}>
                Create New Tag
              </Button>
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button onClick={onDone}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};