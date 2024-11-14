import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const CarForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: {
      car_type: '',
      company: '',
      dealer: ''
    }
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('tags.')) {
      const tagName = name.split('.')[1];
      setFormData({
        ...formData,
        tags: {
          ...formData.tags,
          [tagName]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 10) {
      alert('You can only upload up to 10 images');
      return;
    }
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      
      images.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      await api.post('/cars/new', formDataToSend);
      navigate('/cars');
    } catch (error) {
      console.error('Error creating car:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Car</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
            rows="4"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Car Type
            </label>
            <input
              type="text"
              name="tags.car_type"
              value={formData.tags.car_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Company
            </label>
            <input
              type="text"
              name="tags.company"
              value={formData.tags.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Dealer
            </label>
            <input
              type="text"
              name="tags.dealer"
              value={formData.tags.dealer}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Images (Max 10)
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            multiple
            accept="image/*"
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">
            Selected images: {images.length}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {loading ? 'Creating...' : 'Create Car'}
        </button>
      </form>
    </div>
  );
};