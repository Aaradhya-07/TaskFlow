import React, { useState } from 'react';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Personal Information</h2>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <Avatar
                src={user?.photoURL}
                name={user?.name}
                size="lg"
              />
              {isEditing && (
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <Input
                label="Name"
                defaultValue={user?.name}
                disabled={!isEditing}
              />
              <Input
                label="Email"
                type="email"
                defaultValue={user?.email}
                disabled={!isEditing}
              />
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="primary">
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Password</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
              />
              <Input
                label="New Password"
                type="password"
              />
              <Input
                label="Confirm New Password"
                type="password"
              />
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="primary">
                  Update Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;