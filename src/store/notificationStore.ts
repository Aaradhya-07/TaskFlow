import { create } from 'zustand';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  fetchNotifications: (userId: string) => Promise<void>;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<string>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(notificationsQuery);
      const notifications: Notification[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          message: data.message,
          read: data.read,
          createdAt: data.createdAt.toDate(),
        });
      });
      
      // Sort by date, newest first
      notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      set({ notifications, loading: false });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  createNotification: async (notification) => {
    try {
      set({ loading: true, error: null });
      
      const notificationData = {
        ...notification,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      
      // Update local state
      const newNotification: Notification = {
        id: docRef.id,
        ...notification,
        createdAt: new Date(),
      };
      
      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      set({ loading: true, error: null });
      
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      
      // Update local state
      set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === notificationId ? { ...n, read: true } : n
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const { notifications } = get();
      const unreadNotifications = notifications.filter(
        (n) => n.userId === userId && !n.read
      );
      
      // Update each notification in Firestore
      const updatePromises = unreadNotifications.map((n) => 
        updateDoc(doc(db, 'notifications', n.id), { read: true })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      set((state) => ({
        notifications: state.notifications.map((n) => 
          n.userId === userId ? { ...n, read: true } : n
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },
}));