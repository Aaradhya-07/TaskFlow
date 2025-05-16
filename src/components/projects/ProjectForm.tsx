import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';

interface ProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuthStore();
  const { createProject, loading, error } = useProjectStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }

    if (!user) {
      setFormError('You must be logged in to create a project');
      return;
    }

    try {
      await createProject({
        title,
        description,
        createdBy: user.id,
        members: [user.id],
      });
      
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
        label="Project Title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter project title"
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
          placeholder="Enter project description"
          rows={4}
          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        />
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
          Create Project
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;