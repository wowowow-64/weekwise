
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Save, XCircle } from 'lucide-react';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (newText: string) => void;
}

function TaskItem({ task, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleUpdate = () => {
    if (editText.trim()) {
      onUpdate(editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="group flex items-center gap-2 rounded-md bg-secondary p-2 transition-all duration-300 ease-in-out">
      {isEditing ? (
        <>
          <Input
            ref={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 flex-grow"
          />
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleUpdate} aria-label="Save task">
            <Save className="h-4 w-4 text-green-600" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel} aria-label="Cancel edit">
            <XCircle className="h-4 w-4 text-red-600" />
          </Button>
        </>
      ) : (
        <>
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={onToggle}
            aria-labelledby={`task-label-${task.id}`}
          />
          <label
            id={`task-label-${task.id}`}
            className={cn(
              "flex-grow cursor-pointer text-sm",
              task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
            )}
            onClick={() => onToggle()}
          >
            {task.text}
          </label>
          <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(true)} aria-label="Edit task">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDelete} aria-label="Delete task">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(TaskItem);
