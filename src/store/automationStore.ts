import { create } from 'zustand';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Automation, Task } from '../types';
import { useTaskStore } from './taskStore';
import { useNotificationStore } from './notificationStore';

interface AutomationState {
  automations: Automation[];
  loading: boolean;
  error: string | null;
  fetchAutomations: (projectId: string) => Promise<void>;
  createAutomation: (automation: Omit<Automation, 'id' | 'createdAt'>) => Promise<string>;
  updateAutomation: (automationId: string, updates: Partial<Automation>) => Promise<void>;
  deleteAutomation: (automationId: string) => Promise<void>;
  checkAutomations: (task: Task, triggerType: string) => void;
}

export const useAutomationStore = create<AutomationState>((set, get) => ({
  automations: [],
  loading: false,
  error: null,

  fetchAutomations: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      
      const automationsQuery = query(
        collection(db, 'automations'),
        where('projectId', '==', projectId)
      );
      
      const querySnapshot = await getDocs(automationsQuery);
      const automations: Automation[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        automations.push({
          id: doc.id,
          projectId: data.projectId,
          name: data.name,
          trigger: data.trigger,
          action: data.action,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
        });
      });
      
      set({ automations, loading: false });
    } catch (error) {
      console.error('Error fetching automations:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  createAutomation: async (automation) => {
    try {
      set({ loading: true, error: null });
      
      const automationData = {
        ...automation,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'automations'), automationData);
      
      // Update local state
      const newAutomation: Automation = {
        id: docRef.id,
        ...automation,
        createdAt: new Date(),
      };
      
      set((state) => ({
        automations: [...state.automations, newAutomation],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating automation:', error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateAutomation: async (automationId, updates) => {
    try {
      set({ loading: true, error: null });
      
      const automationRef = doc(db, 'automations', automationId);
      await updateDoc(automationRef, updates);
      
      // Update local state
      set((state) => ({
        automations: state.automations.map((a) => 
          a.id === automationId ? { ...a, ...updates } : a
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error updating automation:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteAutomation: async (automationId) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'automations', automationId));
      
      // Update local state
      set((state) => ({
        automations: state.automations.filter((a) => a.id !== automationId),
        loading: false,
      }));
    } catch (error) {
      console.error('Error deleting automation:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  checkAutomations: (task, triggerType) => {
    const { automations } = get();
    const projectAutomations = automations.filter(
      (a) => a.projectId === task.projectId && a.trigger.type === triggerType
    );
    
    for (const automation of projectAutomations) {
      // Check if the trigger condition is met
      let conditionMet = false;
      
      switch (triggerType) {
        case 'task_status_change':
          conditionMet = automation.trigger.condition.statusId === task.statusId;
          break;
        case 'task_assigned':
          conditionMet = automation.trigger.condition.assigneeId === task.assigneeId;
          break;
        case 'due_date_passed':
          if (task.dueDate) {
            conditionMet = new Date() > new Date(task.dueDate);
          }
          break;
        default:
          break;
      }
      
      if (conditionMet) {
        // Execute the action
        switch (automation.action.type) {
          case 'change_status':
            useTaskStore.getState().updateTask(task.id, {
              statusId: automation.action.data.statusId,
            });
            break;
          case 'assign_badge':
            // This would be implemented in a real app
            console.log('Assigning badge:', automation.action.data.badgeId);
            break;
          case 'send_notification':
            useNotificationStore.getState().createNotification({
              userId: task.assigneeId || task.createdBy,
              title: automation.action.data.title,
              message: automation.action.data.message.replace('{task}', task.title),
              read: false,
            });
            break;
          default:
            break;
        }
      }
    }
  },
}));