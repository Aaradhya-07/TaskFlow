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
import { Task } from '../types';
import { useAutomationStore } from './automationStore';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<string>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newStatusId: string) => Promise<void>;
  assignTask: (taskId: string, assigneeId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      
      const querySnapshot = await getDocs(tasksQuery);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          projectId: data.projectId,
          title: data.title,
          description: data.description,
          statusId: data.statusId,
          dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
          assigneeId: data.assigneeId,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
        });
      });
      
      set({ tasks, loading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  createTask: async (task) => {
    try {
      set({ loading: true, error: null });
      
      const taskData = {
        ...task,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      
      // Update local state
      const newTask: Task = {
        id: docRef.id,
        ...task,
        createdAt: new Date(),
      };
      
      set((state) => ({
        tasks: [...state.tasks, newTask],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      set({ loading: true, error: null });
      
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, updates);
      
      // Get the updated task to check for automations
      const taskSnap = await getDoc(taskRef);
      const updatedTask = { id: taskId, ...taskSnap.data() } as Task;
      
      // Update local state
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === taskId ? { ...t, ...updates } : t
        ),
        loading: false,
      }));
      
      // Check for automations
      if (updates.statusId) {
        useAutomationStore.getState().checkAutomations(updatedTask, 'task_status_change');
      }
      
      if (updates.assigneeId) {
        useAutomationStore.getState().checkAutomations(updatedTask, 'task_assigned');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteTask: async (taskId) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'tasks', taskId));
      
      // Update local state
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
        loading: false,
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  moveTask: async (taskId, newStatusId) => {
    try {
      set({ loading: true, error: null });
      
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { statusId: newStatusId });
      
      // Get the updated task to check for automations
      const taskSnap = await getDoc(taskRef);
      const updatedTask = { id: taskId, ...taskSnap.data() } as Task;
      
      // Update local state
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === taskId ? { ...t, statusId: newStatusId } : t
        ),
        loading: false,
      }));
      
      // Check for automations
      useAutomationStore.getState().checkAutomations(updatedTask, 'task_status_change');
    } catch (error) {
      console.error('Error moving task:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  assignTask: async (taskId, assigneeId) => {
    try {
      set({ loading: true, error: null });
      
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { assigneeId });
      
      // Get the updated task to check for automations
      const taskSnap = await getDoc(taskRef);
      const updatedTask = { id: taskId, ...taskSnap.data() } as Task;
      
      // Update local state
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === taskId ? { ...t, assigneeId } : t
        ),
        loading: false,
      }));
      
      // Check for automations
      useAutomationStore.getState().checkAutomations(updatedTask, 'task_assigned');
    } catch (error) {
      console.error('Error assigning task:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },
}));