import { create } from 'zustand';
import { User, Ticket } from '../types';

interface Store {
  user: User | null;
  tickets: Ticket[];
  users: User[];
  setUser: (user: User | null) => void;
  addTicket: (ticket: Ticket) => void;
  logout: () => void;
  registerUser: (username: string, password: string, name: string) => boolean;
}

export const useStore = create<Store>((set, get) => ({
  user: null,
  tickets: [],
  users: [],
  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  addTicket: (ticket) => {
    set((state) => {
      const newTickets = [...state.tickets, ticket];
      localStorage.setItem('tickets', JSON.stringify(newTickets));
      return { tickets: newTickets };
    });
  },
  logout: () => {
    set({ user: null, tickets: [] });
    localStorage.removeItem('user');
    localStorage.removeItem('tickets');
  },
  registerUser: (username, password, name) => {
    const state = get();
    // Check if username already exists
    if (state.users.some(user => user.username === username)) {
      return false;
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      name
    };

    set((state) => {
      const newUsers = [...state.users, newUser];
      localStorage.setItem('users', JSON.stringify(newUsers));
      return { users: newUsers };
    });

    // Store password securely (in a real app, this would be handled by a backend)
    localStorage.setItem(`password_${username}`, password);
    return true;
  }
}));

// Initialize state from localStorage
const storedUser = localStorage.getItem('user');
const storedTickets = localStorage.getItem('tickets');
const storedUsers = localStorage.getItem('users');

if (storedUser) {
  useStore.setState({ user: JSON.parse(storedUser) });
}
if (storedTickets) {
  useStore.setState({ tickets: JSON.parse(storedTickets) });
}
if (storedUsers) {
  useStore.setState({ users: JSON.parse(storedUsers) });
}