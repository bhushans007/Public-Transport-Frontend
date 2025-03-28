import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PassengerRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_name: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    pin: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // Track registration success

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('https://public-transport.vercel.app/api/passenger/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Registration Successful! Please Login...');
        setIsRegistered(true); // Hide form and button
       setTimeout(() => navigate('/passengerlogin'), 2000);
      } else {
        // Handle duplicate entry errors
        if (data.error.includes('user_name')) {
          setMessage('❌ Username already exists.');
        } else if (data.error.includes('phone')) {
          setMessage('❌ Phone number already exists.');
        } else if (data.error.includes('email')) {
          setMessage('❌ Email already exists.');
        } else {
          setMessage(`❌ ${data.message || 'Registration failed'}`);
        }
      }
    } catch (error) {
      setMessage('❌ Error connecting to server');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Passenger Registration</h2>

      {message && <p className="mb-4 text-center text-blue-500">{message}</p>}

      {!isRegistered && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="user_name"
            placeholder="Username"
            value={formData.user_name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            name="pin"
            placeholder="4-Digit PIN"
            value={formData.pin}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      )}

      {isRegistered && (
        <button
          onClick={() => navigate('/passenger/login')}
          className="mt-4 bg-green-500 text-white p-2 rounded w-full hover:bg-green-600"
        >
          Go to Passenger Login
        </button>
      )}
    </div>
  );
};