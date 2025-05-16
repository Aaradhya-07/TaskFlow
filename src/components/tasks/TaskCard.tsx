import React from 'react';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import Card, { CardContent } from '../ui/Card';
import Avatar from '../ui/Avatar';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  userNames?: { [key: string]: string };
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  userNames = {},
  isDragging = false,
}) => {
  const assigneeName = task.assigneeId ? userNames[task.assigneeId] : null;

  return (
    <Card
      className={`mb-3 transition-shadow hover:shadow-md ${
        isDragging ? 'shadow-lg opacity-75' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {task.title}
        </h4>
        
        {task.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          {task.dueDate && (
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              <span>{format(task.dueDate, 'MMM d')}</span>
            </div>
          )}
          
          {task.assigneeId && (
            <div className="flex items-center">
              {assigneeName ? (
                <Avatar
                  name={assigneeName}
                  size="sm"
                  className="mr-1"
                />
              ) : (
                <User size={12} className="mr-1" />
              )}
              <span className="truncate max-w-[100px]">
                {assigneeName || 'Unassigned'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;