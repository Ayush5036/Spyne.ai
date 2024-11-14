// src/pages/CarList.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export const CarList = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      console.log('Fetching cars...');
      // Updated endpoint to match backend route
      const { data } = await api.get('/cars/all');
      console.log('Cars data:', data);
      setCars(data.cars || []);
      setError(null);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(
        error.response?.data?.message || 
        'Failed to fetch cars. Please try again later.'
      );
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-600">Loading cars...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center h-64 mt-8">
      <p className="text-red-600 mb-4">{error}</p>
      <button 
        onClick={fetchCars}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cars</h1>
        <Link
          to="/cars/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Car
        </Link>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No cars found. Add your first car!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <Link
              key={car._id}
              to={`/cars/${car._id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative h-48">
                {car.images && car.images[0] ? (
                  <img
                    src={car.images[0].url}
                    alt={car.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{car.title}</h2>
                <p className="text-gray-600 line-clamp-2 mb-2">
                  {car.description}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {car.tags && Object.entries(car.tags).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-500 capitalize">
                        {key.replace('_', ' ')}:
                      </span>{' '}
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};