


          
# TaskFlow - Project Management Application

TaskFlow is a modern project management application designed to streamline workflows, enhance team collaboration, and boost productivity. Built with React and Firebase, TaskFlow provides a comprehensive suite of tools for managing projects, tasks, and team coordination.

## Features

### User Management
- **Google Authentication**: Secure sign-in with Google accounts
- **User Profiles**: Personalized user profiles with customizable settings
- **Team Collaboration**: Invite team members to projects via email

### Project Management
- **Project Creation**: Create and manage multiple projects
- **Custom Statuses**: Define custom workflow statuses for each project
- **Team Assignment**: Add team members to specific projects

### Task Management
- **Task Creation**: Create tasks with titles, descriptions, and due dates
- **Status Tracking**: Move tasks through customizable workflow stages
- **Task Assignment**: Assign tasks to specific team members
- **Due Date Management**: Set and track task deadlines

### Automation
- **Workflow Automation**: Create custom automations based on triggers and actions
- **Status Change Triggers**: Automate actions when task statuses change
- **Assignment Triggers**: Trigger automations when tasks are assigned
- **Due Date Triggers**: Set up automations for overdue tasks
- **Notification Actions**: Send automated notifications based on task events
- **Status Change Actions**: Automatically update task statuses based on conditions

### Notifications
- **Real-time Notifications**: Receive notifications for important events
- **Read/Unread Status**: Track which notifications have been read
- **Bulk Actions**: Mark all notifications as read with a single click

### User Interface
- **Responsive Design**: Modern UI that works across devices
- **Dashboard View**: Overview of projects and tasks
- **Theme Settings**: Customize application appearance

## API Documentation

### Authentication API

#### Sign In with Google
```typescript
signInWithGoogle(): Promise<void>
```
Initiates Google authentication flow and signs the user in.

#### Sign Out
```typescript
signOut(): Promise<void>
```
Signs the current user out of the application.

### Project API

#### Fetch Projects
```typescript
fetchProjects(userId: string): Promise<void>
```
Retrieves all projects where the specified user is a member.

#### Fetch Project
```typescript
fetchProject(projectId: string): Promise<void>
```
Retrieves detailed information for a specific project.

#### Create Project
```typescript
createProject(project: Omit<Project, 'id' | 'createdAt' | 'statuses'>): Promise<string>
```
Creates a new project with default statuses and returns the project ID.

#### Update Project
```typescript
updateProject(projectId: string, updates: Partial<Project>): Promise<void>
```
Updates an existing project with the specified changes.

#### Delete Project
```typescript
deleteProject(projectId: string): Promise<void>
```
Deletes a project and all associated data.

#### Add Member
```typescript
addMember(projectId: string, email: string): Promise<void>
```
Adds a user to a project using their email address.

#### Remove Member
```typescript
removeMember(projectId: string, userId: string): Promise<void>
```
Removes a user from a project.

### Task API

#### Fetch Tasks
```typescript
fetchTasks(projectId: string): Promise<void>
```
Retrieves all tasks for a specific project.

#### Create Task
```typescript
createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<string>
```
Creates a new task and returns the task ID.

#### Update Task
```typescript
updateTask(taskId: string, updates: Partial<Task>): Promise<void>
```
Updates an existing task with the specified changes.

#### Delete Task
```typescript
deleteTask(taskId: string): Promise<void>
```
Deletes a task.

#### Move Task
```typescript
moveTask(taskId: string, newStatusId: string): Promise<void>
```
Moves a task to a different status column.

#### Assign Task
```typescript
assignTask(taskId: string, assigneeId: string): Promise<void>
```
Assigns a task to a specific user.


## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **State Management**: Zustand
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Hosting**: Firebase Hosting

## Getting Started

To run TaskFlow locally:

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure Firebase credentials in `src/lib/firebase.ts`
4. Start the development server with `npm start`


        
