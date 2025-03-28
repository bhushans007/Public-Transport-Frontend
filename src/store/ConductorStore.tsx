import { create } from 'zustand';

interface Conductor {
  id: string;
  user_name: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

interface ConductorStore {
  conductor: Conductor | null;
  setConductor: (conductor: Conductor) => void;
  logout: () => void;
}

export const useConductorStore = create<ConductorStore>((set) => ({
  conductor: null,
  setConductor: (conductor) => set({ conductor }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('conductor');
    set({ conductor: null });
  },
}));
