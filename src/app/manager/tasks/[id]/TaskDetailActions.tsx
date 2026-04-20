'use client';

import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EditTaskModal from '@/components/manager/EditTaskModal';
import DeleteTaskModal from '@/components/manager/DeleteTaskModal';

interface TaskDetailActionsProps {
  task: any;
  employees: any[];
}

export default function TaskDetailActions({ task, employees }: TaskDetailActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsEditOpen(true)}
          className="p-2 rounded-xl bg-brand-teal/10 text-brand-teal border border-brand-teal/20 hover:bg-brand-teal/20 transition-colors"
          title="Edit Task"
        >
          <Pencil className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsDeleteOpen(true)}
          className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          title="Delete Task"
        >
          <Trash2 className="w-5 h-5" />
        </button>
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
        onDeleted={() => router.push('/manager/tasks')}
      />
    </>
  );
}
