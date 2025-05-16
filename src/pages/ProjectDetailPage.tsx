import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Settings, 
  Calendar, 
  Trash2, 
  Edit, 
  Zap 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskForm from '../components/tasks/TaskForm';
import InviteMemberForm from '../components/projects/InviteMemberForm';
import AutomationForm from '../components/automation/AutomationForm';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useAutomationStore } from '../store/automationStore';
import { User } from '../types';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();
  const { currentProject, fetchProject } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { automations, fetchAutomations } = useAutomationStore();
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchTasks(projectId);
      fetchAutomations(projectId);
    }
  }, [projectId, fetchProject, fetchTasks, fetchAutomations]);

  useEffect(() => {
    // Fetch project members
    if (currentProject) {
      // In a real app, we would fetch user details from the database
      // For this demo, we'll just create placeholder data
      const members = currentProject.members.map((memberId) => ({
        id: memberId,
        name: memberId === user?.id ? user.name : `Team Member ${memberId.substring(0, 4)}`,
        email: memberId === user?.id ? user.email : `user-${memberId.substring(0, 4)}@example.com`,
      }));
      
      setProjectMembers(members);
      
      // Create a mapping of user IDs to names
      const names = members.reduce<{ [key: string]: string }>((acc, member) => {
        acc[member.id] = member.name;
        return acc;
      }, {});
      
      setUserNames(names);
    }
  }, [currentProject, user]);

  const openTaskModal = () => {
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
  };

  const openInviteModal = () => {
    setIsInviteModalOpen(true);
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
  };

  const openAutomationModal = () => {
    setIsAutomationModalOpen(true);
  };

  const closeAutomationModal = () => {
    setIsAutomationModalOpen(false);
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentProject.title}</h1>
          <p className="text-gray-500 mt-1">{currentProject.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            leftIcon={<Users size={16} />}
            onClick={openInviteModal}
          >
            Invite
          </Button>
          <Button
            variant="outline"
            leftIcon={<Zap size={16} />}
            onClick={openAutomationModal}
          >
            Automation
          </Button>
          <Button
            leftIcon={<Plus size={16} />}
            onClick={openTaskModal}
          >
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Tasks</h2>
            </CardHeader>
            <CardContent>
              <KanbanBoard 
                project={currentProject} 
                tasks={tasks} 
                userNames={userNames} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Team Members</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectMembers.map((member) => (
                  <div key={member.id} className="flex items-center">
                    <Avatar
                      name={member.name}
                      size="sm"
                      className="mr-3"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={<Plus size={16} />}
                className="mt-4"
                onClick={openInviteModal}
              >
                Invite Member
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Automations</h2>
            </CardHeader>
            <CardContent>
              {automations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="mb-2">No automations yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Zap size={16} />}
                    onClick={openAutomationModal}
                  >
                    Create Automation
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {automations.map((automation) => (
                    <div
                      key={automation.id}
                      className="p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {automation.name}
                        </h3>
                        <div className="flex space-x-1">
                          <button className="text-gray-400 hover:text-gray-600">
                            <Edit size={14} />
                          </button>
                          <button className="text-gray-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {automation.trigger.type === 'task_status_change'
                          ? 'When task status changes'
                          : automation.trigger.type === 'task_assigned'
                          ? 'When task is assigned'
                          : 'When due date passes'}
                      </p>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<Plus size={16} />}
                    onClick={openAutomationModal}
                  >
                    Add Automation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        title="Create New Task"
        size="md"
      >
        <TaskForm
          projectId={projectId || ''}
          onSuccess={closeTaskModal}
          onCancel={closeTaskModal}
          userNames={userNames}
        />
      </Modal>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={closeInviteModal}
        title="Invite Team Member"
        size="md"
      >
        <InviteMemberForm
          projectId={projectId || ''}
          onSuccess={closeInviteModal}
          onCancel={closeInviteModal}
        />
      </Modal>

      <Modal
        isOpen={isAutomationModalOpen}
        onClose={closeAutomationModal}
        title="Create Automation"
        size="lg"
      >
        <AutomationForm
          projectId={projectId || ''}
          onSuccess={closeAutomationModal}
          onCancel={closeAutomationModal}
          userNames={userNames}
        />
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;