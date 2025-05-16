import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, CheckSquare } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardContent } from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      fetchProjects(user.id);
    }
  }, [user, fetchProjects]);

  useEffect(() => {
    // Fetch tasks for all projects
    if (projects.length > 0) {
      Promise.all(projects.map((project) => fetchTasks(project.id)));
    }
  }, [projects, fetchTasks]);

  useEffect(() => {
    // Create a mapping of user IDs to names
    // In a real app, we would fetch user details from the database
    const names: { [key: string]: string } = {};
    if (user) {
      names[user.id] = user.name;
    }
    
    // Add placeholder names for other users
    projects.forEach((project) => {
      project.members.forEach((memberId) => {
        if (!names[memberId]) {
          names[memberId] = `User ${memberId.substring(0, 4)}`;
        }
      });
    });
    
    setUserNames(names);
  }, [projects, user]);

  useEffect(() => {
    let filtered = [...tasks];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((task) => {
        const project = projects.find((p) => p.id === task.projectId);
        const status = project?.statuses.find((s) => s.id === task.statusId);
        return status?.name.toLowerCase() === filterStatus.toLowerCase();
      });
    }
    
    // Filter by project
    if (filterProject !== 'all') {
      filtered = filtered.filter((task) => task.projectId === filterProject);
    }
    
    setFilteredTasks(filtered);
  }, [searchTerm, filterStatus, filterProject, tasks, projects]);

  const getStatusName = (task: Task) => {
    const project = projects.find((p) => p.id === task.projectId);
    const status = project?.statuses.find((s) => s.id === task.statusId);
    return status?.name || 'Unknown';
  };

  const getStatusVariant = (statusName: string) => {
    const name = statusName.toLowerCase();
    if (name === 'to do') return 'default';
    if (name === 'in progress') return 'primary';
    if (name === 'done') return 'success';
    return 'default';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/projects/${task.projectId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 pr-8"
            >
              <option value="all">All Statuses</option>
              <option value="to do">To Do</option>
              <option value="in progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Filter size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <div className="relative">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 pr-8"
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Filter size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <CheckSquare size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterProject !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Task
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Project
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Assignee
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getProjectName(task.projectId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={getStatusVariant(getStatusName(task)) as any}
                        >
                          {getStatusName(task)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.assigneeId ? (
                          <div className="flex items-center">
                            <Avatar
                              name={userNames[task.assigneeId] || 'User'}
                              size="sm"
                              className="mr-2"
                            />
                            <div className="text-sm text-gray-900">
                              {userNames[task.assigneeId] || 'Unknown'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Unassigned
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.dueDate ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar size={14} className="mr-1 text-gray-400" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No due date</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TasksPage;