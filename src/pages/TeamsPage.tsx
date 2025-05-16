import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';

const TeamsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (user) {
      fetchProjects(user.id);
    }
  }, [user, fetchProjects]);

  useEffect(() => {
    // Collect unique team members from all projects
    const members: { [key: string]: any } = {};
    if (user) {
      members[user.id] = {
        id: user.id,
        name: user.name,
        email: user.email,
        projects: []
      };
    }

    projects.forEach(project => {
      project.members.forEach(memberId => {
        if (!members[memberId]) {
          members[memberId] = {
            id: memberId,
            name: `Team Member ${memberId.substring(0, 4)}`,
            email: `user-${memberId.substring(0, 4)}@example.com`,
            projects: []
          };
        }
        members[memberId].projects.push(project.title);
      });
    });

    setTeamMembers(members);
  }, [projects, user]);

  const filteredMembers = Object.values(teamMembers).filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            leftIcon={<Plus size={16} />}
          >
            Invite Member
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">All Team Members</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <Avatar
                    name={member.name}
                    size="md"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {member.projects.length} projects
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamsPage;