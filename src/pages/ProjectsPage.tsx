import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProjectCard from '../components/projects/ProjectCard';
import Modal from '../components/ui/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';

const ProjectsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(projects);

  useEffect(() => {
    if (user) {
      fetchProjects(user.id);
    }
  }, [user, fetchProjects]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchTerm, projects]);

  const openProjectModal = () => {
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            leftIcon={<Plus size={16} />}
            onClick={openProjectModal}
          >
            New Project
          </Button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? 'Try a different search term'
              : 'Create your first project to get started'}
          </p>
          {!searchTerm && (
            <Button onClick={openProjectModal}>Create Project</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

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

export default ProjectsPage;