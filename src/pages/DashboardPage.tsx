import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckSquare } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import ProjectCard from '../components/projects/ProjectCard';
import Modal from '../components/ui/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);
  const [userTasks, setUserTasks] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProjects(user.id);
    }
  }, [user, fetchProjects]);

  useEffect(() => {
    // Get recent projects (last 3)
    const sorted = [...projects].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    setRecentProjects(sorted.slice(0, 3));

    // Fetch tasks for all projects
    if (projects.length > 0) {
      Promise.all(projects.map((project) => fetchTasks(project.id)));
    }
  }, [projects, fetchTasks]);

  useEffect(() => {
    // Get tasks assigned to current user
    if (user) {
      const userAssignedTasks = tasks.filter(
        (task) => task.assigneeId === user.id
      );
      setUserTasks(userAssignedTasks);
    }
  }, [tasks, user]);

  const openProjectModal = () => {
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={openProjectModal}
        >
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Recent Projects</h2>
              <Link
                to="/projects"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No projects yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={openProjectModal}
                >
                  Create your first project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    <Link to={`/projects/${project.id}`}>
                      <h3 className="font-medium text-gray-900">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">My Tasks</h2>
              <Link
                to="/tasks"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {userTasks.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No tasks assigned to you</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    <div className="mr-3">
                      <CheckSquare size={18} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/projects/${task.projectId}`}>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <div className="flex items-center mt-1">
                            <Clock size={12} className="text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500">
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Quick Stats</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-700">Total Projects</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                  {projects.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-green-700">Total Tasks</p>
                <p className="text-2xl font-bold text-green-800 mt-1">
                  {tasks.length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-md">
                <p className="text-sm text-purple-700">My Tasks</p>
                <p className="text-2xl font-bold text-purple-800 mt-1">
                  {userTasks.length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-sm text-yellow-700">Completed</p>
                <p className="text-2xl font-bold text-yellow-800 mt-1">
                  {tasks.filter((t) => {
                    const project = projects.find((p) => p.id === t.projectId);
                    const doneStatus = project?.statuses.find(
                      (s) => s.name.toLowerCase() === 'done'
                    );
                    return doneStatus && t.statusId === doneStatus.id;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isProjectModalOpen}
        onClose={closeProjectModal}
        title="Create New Project"
        size="md"
      >
        <ProjectForm onSuccess={closeProjectModal} onCancel={closeProjectModal} />
      </Modal>
    </div>
  );
};

export default DashboardPage;