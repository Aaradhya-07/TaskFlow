import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useProjectStore } from '../../store/projectStore';

interface InviteMemberFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const InviteMemberForm: React.FC<InviteMemberFormProps> = ({
  projectId,
  onSuccess,
  onCancel,
}) => {
  const { addMember, loading, error } = useProjectStore();
  
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      await addMember(projectId, email);
      
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
        label="Email Address"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter team member's email"
        fullWidth
        required
      />

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
          Invite Member
        </Button>
      </div>
    </form>
  );
};

export default InviteMemberForm;