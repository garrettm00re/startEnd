// components/NewTagDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTagName: string;
  setNewTagName: (name: string) => void;
  newTagColor: string;
  setNewTagColor: (color: string) => void;
  onCreateTag: () => void;
}

export const NewTagDialog: React.FC<NewTagDialogProps> = ({
  open,
  onOpenChange,
  newTagName,
  setNewTagName,
  newTagColor,
  setNewTagColor,
  onCreateTag,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button onClick={onCreateTag}>Create Tag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
