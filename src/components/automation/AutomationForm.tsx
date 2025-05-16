import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuthStore } from '../../store/authStore';
import { useAutomationStore } from '../../store/automationStore';
import { useProjectStore } from '../../store/projectStore';
import { Automation } from '../../types';

interface AutomationFormProps {
  projectId: string;
  automation?: Automation;
  onSuccess?: () => void;
  onCancel?: () => void;
  userNames?: { [key: string]: string };
}

const AutomationForm: React.FC<AutomationFormProps> = ({
  projectId,
  automation,
  onSuccess,
  onCancel,
  userNames = {},
}) => {
  const { user } = useAuthStore();
  const { createAutomation, updateAutomation, loading, error } = useAutomationStore();
  const { currentProject } = useProjectStore();
  
  const [name, setName] = useState(automation?.name || '');
  const [triggerType, setTriggerType] = useState(automation?.trigger.type || 'task_status_change');
  const [actionType, setActionType] = useState(automation?.action.type || 'change_status');
  
  // Trigger conditions
  const [triggerStatusId, setTriggerStatusId] = useState(
    automation?.trigger.type === 'task_status_change' 
      ? automation.trigger.condition.statusId 
      : ''
  );
  const [triggerAssigneeId, setTriggerAssigneeId] = useState(
    automation?.trigger.type === 'task_assigned' 
      ? automation.trigger.condition.assigneeId 
      : ''
  );
  
  // Action data
  const [actionStatusId, setActionStatusId] = useState(
    automation?.action.type === 'change_status' 
      ? automation.action.data.statusId 
      : ''
  );
  const [actionBadgeId, setActionBadgeId] = useState(
    automation?.action.type === 'assign_badge' 
      ? automation.action.data.badgeId 
      : 'completed'
  );
  const [notificationTitle, setNotificationTitle] = useState(
    automation?.action.type === 'send_notification' 
      ? automation.action.data.title 
      : 'Task Update'
  );
  const [notificationMessage, setNotificationMessage] = useState(
    automation?.action.type === 'send_notification' 
      ? automation.action.data.message 
      : 'Your task {task} has been updated'
  );
  
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }

    if (!user) {
      setFormError('You must be logged in to create an automation');
      return;
    }

    try {
      // Build trigger condition based on type
      let triggerCondition: any = {};
      switch (triggerType) {
        case 'task_status_change':
          if (!triggerStatusId) {
            setFormError('Status is required for this trigger');
            return;
          }
          triggerCondition = { statusId: triggerStatusId };
          break;
        case 'task_assigned':
          if (!triggerAssigneeId) {
            setFormError('Assignee is required for this trigger');
            return;
          }
          triggerCondition = { assigneeId: triggerAssigneeId };
          break;
        case 'due_date_passed':
          triggerCondition = { passed: true };
          break;
      }

      // Build action data based on type
      let actionData: any = {};
      switch (actionType) {
        case 'change_status':
          if (!actionStatusId) {
            setFormError('Status is required for this action');
            return;
          }
          actionData = { statusId: actionStatusId };
          break;
        case 'assign_badge':
          actionData = { badgeId: actionBadgeId };
          break;
        case 'send_notification':
          if (!notificationTitle || !notificationMessage) {
            setFormError('Title and message are required for notifications');
            return;
          }
          actionData = { 
            title: notificationTitle, 
            message: notificationMessage 
          };
          break;
      }

      const automationData = {
        projectId,
        name,
        trigger: {
          type: triggerType,
          condition: triggerCondition,
        },
        action: {
          type: actionType,
          data: actionData,
        },
        createdBy: user.id,
      };

      if (automation) {
        // Update existing automation
        await updateAutomation(automation.id, automationData);
      } else {
        // Create new automation
        await createAutomation(automationData);
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
        label="Automation Name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter automation name"
        fullWidth
        required
      />

      <div className="space-y-4 border-t border-b border-gray-200 py-4">
        <h3 className="font-medium text-gray-700">When this happens (Trigger):</h3>
        
        <div>
          <label
            htmlFor="triggerType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Trigger Type
          </label>
          <select
            id="triggerType"
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value)}
            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          >
            <option value="task_status_change">Task status changes</option>
            <option value="task_assigned">Task is assigned</option>
            <option value="due_date_passed">Due date passes</option>
          </select>
        </div>

        {triggerType === 'task_status_change' && (
          <div>
            <label
              htmlFor="triggerStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              When task status changes to
            </label>
            <select
              id="triggerStatus"
              value={triggerStatusId}
              onChange={(e) => setTriggerStatusId(e.target.value)}
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
        )}

        {triggerType === 'task_assigned' && (
          <div>
            <label
              htmlFor="triggerAssignee"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              When task is assigned to
            </label>
            <select
              id="triggerAssignee"
              value={triggerAssigneeId}
              onChange={(e) => setTriggerAssigneeId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              required
            >
              <option value="">Select assignee</option>
              {currentProject?.members.map((memberId) => (
                <option key={memberId} value={memberId}>
                  {userNames[memberId] || memberId}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">Do this (Action):</h3>
        
        <div>
          <label
            htmlFor="actionType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Action Type
          </label>
          <select
            id="actionType"
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          >
            <option value="change_status">Change task status</option>
            <option value="assign_badge">Assign badge</option>
            <option value="send_notification">Send notification</option>
          </select>
        </div>

        {actionType === 'change_status' && (
          <div>
            <label
              htmlFor="actionStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Change status to
            </label>
            <select
              id="actionStatus"
              value={actionStatusId}
              onChange={(e) => setActionStatusId(e.target.value)}
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
        )}

        {actionType === 'assign_badge' && (
          <div>
            <label
              htmlFor="actionBadge"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Assign badge
            </label>
            <select
              id="actionBadge"
              value={actionBadgeId}
              onChange={(e) => setActionBadgeId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            >
              <option value="completed">Completed</option>
              <option value="star">Star</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        )}

        {actionType === 'send_notification' && (
          <>
            <div>
              <label
                htmlFor="notificationTitle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notification Title
              </label>
              <Input
                id="notificationTitle"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="Enter notification title"
                fullWidth
                required
              />
            </div>
            <div>
              <label
                htmlFor="notificationMessage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notification Message
              </label>
              <textarea
                id="notificationMessage"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter notification message (use {task} for task title)"
                rows={2}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Use {'{task}'} to include the task title in your message.
              </p>
            </div>
          </>
        )}
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
          {automation ? 'Update Automation' : 'Create Automation'}
        </Button>
      </div>
    </form>
  );
};

export default AutomationForm;