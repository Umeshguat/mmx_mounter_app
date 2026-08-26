import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { initialAssignments, type AssignmentStatus, type TaskAssignment } from '../data/mockData';

type NewAssignmentInput = {
  campaignName: string;
  location?: string;
  mounterId: string;
  mounterName: string;
};

type AssignmentState = {
  assignments: TaskAssignment[];
  addAssignment: (input: NewAssignmentInput) => Promise<void>;
  setStatus: (id: string, status: AssignmentStatus) => Promise<void>;
};

const AssignmentContext = createContext<AssignmentState | null>(null);

const STORAGE_KEY = 'mmx_assignments';

export function AssignmentProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<TaskAssignment[]>(initialAssignments);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        setAssignments(JSON.parse(raw));
      } catch {
        // ignore malformed cache, fall back to initialAssignments
      }
    });
  }, []);

  const persist = async (next: TaskAssignment[]) => {
    setAssignments(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addAssignment = async (input: NewAssignmentInput) => {
    const entry: TaskAssignment = {
      id: `a-${assignments.length}-${input.mounterId}-${Date.now()}`,
      campaignName: input.campaignName,
      location: input.location,
      mounterId: input.mounterId,
      mounterName: input.mounterName,
      assignedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'pending',
    };
    await persist([entry, ...assignments]);
  };

  const setStatus = async (id: string, status: AssignmentStatus) => {
    await persist(assignments.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const value = useMemo(
    () => ({ assignments, addAssignment, setStatus }),
    [assignments]
  );

  return <AssignmentContext.Provider value={value}>{children}</AssignmentContext.Provider>;
}

export function useAssignments() {
  const ctx = useContext(AssignmentContext);
  if (!ctx) throw new Error('useAssignments must be used within AssignmentProvider');
  return ctx;
}
