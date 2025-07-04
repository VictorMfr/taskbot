import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

export interface Task {
  id: number;
  nombre: string;
  descripcion: string;
  prioridad: string;
  fecha_limite: string;
  estado: string;
  tarea_padre_id: number | null;
  subtareas?: Task[];
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch('/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error al obtener tareas');
      const data = await res.json();
      setTasks(data.tareas);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (task: Partial<Task>) => {
    setError(null);
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error('Error al crear tarea');
      await fetchTasks();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    setError(null);
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Error al actualizar tarea');
      await fetchTasks();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const deleteTask = async (id: number) => {
    setError(null);
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error al eliminar tarea');
      await fetchTasks();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
} 