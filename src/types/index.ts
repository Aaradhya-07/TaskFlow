export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  members: string[]; // User IDs
  statuses: Status[];
}

export interface Status {
  id: string;
  name: string;
  order: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  statusId: string;
  dueDate?: Date;
  assigneeId?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Automation {
  id: string;
  projectId: string;
  name: string;
  trigger: {
    type: 'task_status_change' | 'task_assigned' | 'due_date_passed';
    condition: any; // Specific to trigger type
  };
  action: {
    type: 'change_status' | 'assign_badge' | 'send_notification';
    data: any; // Specific to action type
  };
  createdBy: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}