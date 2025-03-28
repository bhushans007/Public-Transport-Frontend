import { create } from 'zustand';

interface Passenger {
  id: string;
  user_name: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  rewardPoints: number;
}

interface PassengerStore {
  user: Passenger | null;
  setUser: (user: Passenger | null) => void;
  logout: () => void;
}

export const usePassengerStore = create<PassengerStore>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  logout: () => {
    set({ user: null });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
}));

// Initialize state from localStorage
const storedUser = localStorage.getItem('user');
if (storedUser) {
  usePassengerStore.setState({ user: JSON.parse(storedUser) });
}
