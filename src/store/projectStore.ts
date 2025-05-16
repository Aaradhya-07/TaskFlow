import { create } from 'zustand';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project, Status } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: (userId: string) => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'statuses'>) => Promise<string>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addMember: (projectId: string, email: string) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  addStatus: (projectId: string, status: Omit<Status, 'id'>) => Promise<void>;
  updateStatus: (projectId: string, statusId: string, updates: Partial<Status>) => Promise<void>;
  deleteStatus: (projectId: string, statusId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      // Query projects where user is a member
      const projectsQuery = query(
        collection(db, 'projects'),
        where('members', 'array-contains', userId)
      );
      
      const querySnapshot = await getDocs(projectsQuery);
      const projects: Project[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
          members: data.members,
          statuses: data.statuses || [],
        });
      });
      
      set({ projects, loading: false });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchProject: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const data = projectSnap.data();
        const project: Project = {
          id: projectSnap.id,
          title: data.title,
          description: data.description,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
          members: data.members,
          statuses: data.statuses || [],
        };
        
        set({ currentProject: project, loading: false });
      } else {
        set({ error: 'Project not found', loading: false });
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  createProject: async (project) => {
    try {
      set({ loading: true, error: null });
      
      // Add default statuses
      const defaultStatuses: Status[] = [
        { id: 'todo', name: 'To Do', order: 0 },
        { id: 'in-progress', name: 'In Progress', order: 1 },
        { id: 'done', name: 'Done', order: 2 },
      ];
      
      const projectData = {
        ...project,
        createdAt: serverTimestamp(),
        statuses: defaultStatuses,
      };
      
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      
      // Update local state
      const newProject: Project = {
        id: docRef.id,
        ...project,
        createdAt: new Date(),
        statuses: defaultStatuses,
      };
      
      set((state) => ({
        projects: [...state.projects, newProject],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateProject: async (projectId, updates) => {
    try {
      set({ loading: true, error: null });
      
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, updates);
      
      // Update local state
      set((state) => ({
        projects: state.projects.map((p) => 
          p.id === projectId ? { ...p, ...updates } : p
        ),
        currentProject: state.currentProject?.id === projectId 
          ? { ...state.currentProject, ...updates } 
          : state.currentProject,
        loading: false,
      }));
    } catch (error) {
      console.error('Error updating project:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteProject: async (projectId) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'projects', projectId));
      
      // Update local state
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId 
          ? null 
          : state.currentProject,
        loading: false,
      }));
    } catch (error) {
      console.error('Error deleting project:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  addMember: async (projectId, email) => {
    try {
      set({ loading: true, error: null });
      
      // First, find user by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      if (querySnapshot.empty) {
        set({ error: 'User not found', loading: false });
        return;
      }
      
      const userId = querySnapshot.docs[0].id;
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        set({ error: 'Project not found', loading: false });
        return;
      }
      
      const project = projectSnap.data();
      
      if (project.members.includes(userId)) {
        set({ error: 'User is already a member', loading: false });
        return;
      }
      
      // Add user to project members
      await updateDoc(projectRef, {
        members: [...project.members, userId],
      });
      
      // Update local state
      set((state) => {
        const updatedProjects = state.projects.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              members: [...p.members, userId],
            };
          }
          return p;
        });
        
        const updatedCurrentProject = state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              members: [...state.currentProject.members, userId],
            }
          : state.currentProject;
        
        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          loading: false,
        };
      });
    } catch (error) {
      console.error('Error adding member:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  removeMember: async (projectId, userId) => {
    try {
      set({ loading: true, error: null });
      
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        set({ error: 'Project not found', loading: false });
        return;
      }
      
      const project = projectSnap.data();
      
      // Remove user from project members
      await updateDoc(projectRef, {
        members: project.members.filter((id: string) => id !== userId),
      });
      
      // Update local state
      set((state) => {
        const updatedProjects = state.projects.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              members: p.members.filter((id) => id !== userId),
            };
          }
          return p;
        });
        
        const updatedCurrentProject = state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              members: state.currentProject.members.filter((id) => id !== userId),
            }
          : state.currentProject;
        
        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          loading: false,
        };
      });
    } catch (error) {
      console.error('Error removing member:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  addStatus: async (projectId, status) => {
    try {
      set({ loading: true, error: null });
      
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        set({ error: 'Project not found', loading: false });
        return;
      }
      
      const project = projectSnap.data();
      const newStatus: Status = {
        id: `status-${Date.now()}`,
        ...status,
      };
      
      // Add status to project
      await updateDoc(projectRef, {
        statuses: [...(project.statuses || []), newStatus],
      });
      
      // Update local state
      set((state) => {
        const updatedProjects = state.projects.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              statuses: [...(p.statuses || []), newStatus],
            };
          }
          return p;
        });
        
        const updatedCurrentProject = state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              statuses: [...(state.currentProject.statuses || []), newStatus],
            }
          : state.currentProject;
        
        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          loading: false,
        };
      });
    } catch (error) {
      console.error('Error adding status:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateStatus: async (projectId, statusId, updates) => {
    try {
      set({ loading: true, error: null });
      
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        set({ error: 'Project not found', loading: false });
        return;
      }
      
      const project = projectSnap.data();
      const updatedStatuses = (project.statuses || []).map((s: Status) => {
        if (s.id === statusId) {
          return { ...s, ...updates };
        }
        return s;
      });
      
      // Update statuses in project
      await updateDoc(projectRef, {
        statuses: updatedStatuses,
      });
      
      // Update local state
      set((state) => {
        const updatedProjects = state.projects.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              statuses: (p.statuses || []).map((s) => {
                if (s.id === statusId) {
                  return { ...s, ...updates };
                }
                return s;
              }),
            };
          }
          return p;
        });
        
        const updatedCurrentProject = state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              statuses: (state.currentProject.statuses || []).map((s) => {
                if (s.id === statusId) {
                  return { ...s, ...updates };
                }
                return s;
              }),
            }
          : state.currentProject;
        
        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          loading: false,
        };
      });
    } catch (error) {
      console.error('Error updating status:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteStatus: async (projectId, statusId) => {
    try {
      set({ loading: true, error: null });
      
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        set({ error: 'Project not found', loading: false });
        return;
      }
      
      const project = projectSnap.data();
      const updatedStatuses = (project.statuses || []).filter(
        (s: Status) => s.id !== statusId
      );
      
      // Update statuses in project
      await updateDoc(projectRef, {
        statuses: updatedStatuses,
      });
      
      // Update local state
      set((state) => {
        const updatedProjects = state.projects.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              statuses: (p.statuses || []).filter((s) => s.id !== statusId),
            };
          }
          return p;
        });
        
        const updatedCurrentProject = state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              statuses: (state.currentProject.statuses || []).filter(
                (s) => s.id !== statusId
              ),
            }
          : state.currentProject;
        
        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          loading: false,
        };
      });
    } catch (error) {
      console.error('Error deleting status:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },
}));