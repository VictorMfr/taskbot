"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Task } from '@/hooks/useTasks';

interface TaskContextType {
  refreshTasks: () => void;
  isRefreshing: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshTasks = useCallback(() => {
    setIsRefreshing(true);
    // Simular un pequeño delay para mostrar el estado de carga
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, []);

  return (
    <TaskContext.Provider value={{ refreshTasks, isRefreshing }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
} 