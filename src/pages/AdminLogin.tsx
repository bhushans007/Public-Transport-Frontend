import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
// import { useStore } from '../store/useStore';
import { AuthContainer } from './AuthContainer';
import { LoadingSpinner } from './LoadingSpinner';

export const AdminLogin: React.FC = () => {
  const [user_name, setuser_name] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user_name.trim() || !password.trim()) {
      setError('Both fields are required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://public-transport.vercel.app/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: user_name.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Admin login failed');
      }

      if (!data.admin || !data.admin.id || !data.admin.user_name) {
        throw new Error('Invalid admin data received');
      }

      localStorage.setItem('adminToken', data.token || '');
      localStorage.setItem('adminData', JSON.stringify(data.admin));
      
      // Redirect to admin dashboard
      navigate('/adminDashboard');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      console.error('Admin login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer title="Admin Login">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="user_name" className="sr-only">Admin user_name</label>
            <input
              id="user_name"
              name="user_name"
              type="text"
              required
              value={user_name}
              onChange={(e) => setuser_name(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Admin user_name"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              //minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner /> : 'Login as Admin'}
          </button>
        </div>
      </form>
    </AuthContainer>
  );
};