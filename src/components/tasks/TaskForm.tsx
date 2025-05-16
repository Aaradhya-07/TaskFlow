import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { Task, Project } from '../../types';

interface TaskFormProps {
  projectId: string;
  task?: Task;
  statusId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  userNames?: { [key: string]: string };
}

const TaskForm: React.FC<TaskFormProps> = ({
  projectId,
  task,
  statusId,
  onSuccess,
  onCancel,
  userNames = {},
}) => {
  const { user } = useAuthStore();
  const { createTask, updateTask, loading, error } = useTaskStore();
  const { currentProject } = useProjectStore();
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [selectedStatus, setSelectedStatus] = useState(task?.statusId || statusId || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? format(task.dueDate) : ''
  );
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '');
  const [formError, setFormError] = useState<string | null>(null);

  // Format date for input field
  function format(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  useEffect(() => {
    if (statusId && !selectedStatus) {
      setSelectedStatus(statusId);
    }
  }, [statusId, selectedStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }

    if (!selectedStatus) {
      setFormError('Status is required');
      return;
    }

    if (!user) {
      setFormError('You must be logged in to create a task');
      return;
    }

    try {
      const taskData = {
        projectId,
        title,
        description,
        statusId: selectedStatus,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId: assigneeId || undefined,
        createdBy: user.id,
      };

      if (task) {
        // Update existing task
        await updateTask(task.id, taskData);
      } else {
        // Create new task
        await createTask(taskData);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(formError || error) && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {formError || error}
        </div>
      )}

      <Input
        label="Task Title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title"
        fullWidth
        required
      />

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          rows={3}
          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        />
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <select
          id="status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          required
        >
          <option value="">Select status</option>
          {currentProject?.statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="dueDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Due Date
        </label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          fullWidth
        />
      </div>

      <div>
        <label
          htmlFor="assignee"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Assignee
        </label>
        <select
          id="assignee"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        >
          <option value="">Unassigned</option>
          {currentProject?.members.map((memberId) => (
            <option key={memberId} value={memberId}>
              {userNames[memberId] || memberId}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          isLoading={loading}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;