import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import Card, { CardContent } from '../ui/Card';
import Avatar from '../ui/Avatar';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  memberNames?: { [key: string]: string };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, memberNames = {} }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <Card 
      className="h-full transition-shadow hover:shadow-lg cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {project.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
        
        <div className="flex items-center text-gray-500 text-xs mb-4">
          <Clock size={14} className="mr-1" />
          <span>Created {format(project.createdAt, 'MMM d, yyyy')}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.members.slice(0, 3).map((memberId) => (
              <Avatar
                key={memberId}
                name={memberNames[memberId] || 'User'}
                size="sm"
                className="border-2 border-white"
              />
            ))}
            
            {project.members.length > 3 && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 border-2 border-white text-xs font-medium text-gray-600">
                +{project.members.length - 3}
              </div>
            )}
          </div>
          
          <div className="flex items-center text-gray-500 text-xs">
            <Users size={14} className="mr-1" />
            <span>{project.members.length} members</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;