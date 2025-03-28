export interface User {
  id: string;
  username: string;
  name: string;
}

export interface Ticket {
  id: string;
  passengerId: string;
  from: string;
  to: string;
  passengers: number;
  fare: number;
  timestamp: number;
  conductorId: string;
}

export interface Location {
  id: string;
  name: string;
  distance: number;
}