'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import EditTaskModal from './EditTaskModal';
import DeleteTaskModal from './DeleteTaskModal';

interface TaskCardActionsProps {
  task: any;
  employees: any[];
}

export default function TaskCardActions({ task, employees }: TaskCardActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditOpen(true);
          }}
          className="p-2 text-brand-muted hover:text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors"
          title="Edit Task"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDeleteOpen(true);
          }}
          className="p-2 text-brand-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <Link
          href={`/manager/tasks/${task.id}`}
          onClick={(e) => e.stopPropagation()}
          className="p-2 text-brand-muted hover:text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </div>

      <EditTaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        task={task}
        employees={employees}
      />

      <DeleteTaskModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
      />
    </>
  );
}
