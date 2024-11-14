import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [newImages, setNewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: {
      car_type: '',
      company: '',
      dealer: ''
    }
  });

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/cars/${id}`);
      setCar(data.car);
      setFormData({
        title: data.car.title || '',
        description: data.car.description || '',
        tags: {
          car_type: data.car.tags.car_type || '',
          company: data.car.tags.company || '',
          dealer: data.car.tags.dealer || ''
        }
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching car details:', error);
      setError('Failed to load car details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('tag-')) {
      const tagName = name.replace('tag-', '');
      setFormData(prev => ({
        ...prev,
        tags: {
          ...prev.tags,
          [tagName]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setNewImages(prev => [...prev, ...newImagePreviews]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleRemoveExistingImage = (imageId) => {
    setDeletedImages(prev => [...prev, imageId]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Append basic form data
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      
      // Append deleted images
      if (deletedImages.length > 0) {
        formDataToSend.append('deletedImages', JSON.stringify(deletedImages));
      }
      
      // Append new images
      newImages.forEach(image => {
        formDataToSend.append('images', image.file);
      });
      console.log(formDataToSend)
      const { data } = await api.patch(`/cars/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Cleanup image previews
      newImages.forEach(image => URL.revokeObjectURL(image.preview));
      setCar(data.car);
      setEditing(false);
      setNewImages([]);
      setDeletedImages([]);
      setError(null);
    } catch (error) {
      console.error('Error updating car:', error);
      setError('Failed to update car. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        const response = await api.delete(`/cars/${id}`);
        
        if (response.data.success) {
          navigate('/cars');
        } else {
          setError(response.data.message || 'Failed to delete car');
        }
      } catch (error) {
        console.error('Error deleting car:', error);
        
        // Handle specific error cases
        if (error.response) {
          switch (error.response.status) {
            case 401:
              setError('Please login to delete this car');
              break;
            case 403:
              setError('You are not authorized to delete this car');
              break;
            case 404:
              setError('Car not found');
              break;
            default:
              setError('Failed to delete car. Please try again.');
          }
        } else if (error.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/cars')}
        >
          Back to Cars
        </button>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg mb-4">Car not found</div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/cars')}
        >
          Back to Cars
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate('/cars')}
          >
            Back to Cars
          </button>
        </div>
      ) : !car ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-lg mb-4">Car not found</div>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate('/cars')}
          >
            Back to Cars
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            {/* Image Gallery - Shown in both edit and view modes */}
            <div className="mb-8">
              {/* Main Image Display */}
              {(car.images && car.images.length > 0) && (
                <>
                  <div className="w-full aspect-video relative rounded-lg overflow-hidden mb-4 border border-gray-200">
                    <img
                      src={car.images[selectedImage].url}
                      alt={`${car.title} - Image ${selectedImage + 1}`}
                      className="w-full h-full object-contain bg-gray-50"
                    />
                  </div>
                  {/* Thumbnail Gallery */}
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {car.images.map((image, index) => (
                      <button
                        key={image._id}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 
                          ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'}
                          hover:border-blue-300 transition-colors duration-200`}
                      >
                        <img
                          src={image.url}
                          alt={`${car.title} - Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {editing ? (
              // Edit Mode
              <form onSubmit={handleUpdate} className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Tags Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Car Type
                      </label>
                      <input
                        type="text"
                        name="tag-car_type"
                        value={formData.tags.car_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        name="tag-company"
                        value={formData.tags.company}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dealer
                      </label>
                      <input
                        type="text"
                        name="tag-dealer"
                        value={formData.tags.dealer}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Management Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                  
                  {/* Existing Images */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {car.images
                      .filter(image => !deletedImages.includes(image.public_id))
                      .map((image) => (
                        <div key={image.public_id} className="relative group">
                          <img
                            src={image.url}
                            alt="Car"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(image.public_id)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="block w-4 h-4">×</span>
                          </button>
                        </div>
                    ))}
                  </div>

                  {/* New Images Preview */}
                  {newImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {newImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview}
                            alt={`New upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="block w-4 h-4">×</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image Upload Input */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add New Images
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3">
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditing(false);
                      setNewImages([]);
                      setDeletedImages([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // View Mode
              <div className="space-y-6">
                {/* Title and Description */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{car.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{car.description}</p>
                </div>
                
                {/* Tags Display */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="block text-sm font-medium text-gray-600 mb-1">Car Type</span>
                      <span className="text-gray-900">{car.tags.car_type || 'Not specified'}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="block text-sm font-medium text-gray-600 mb-1">Company</span>
                      <span className="text-gray-900">{car.tags.company || 'Not specified'}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="block text-sm font-medium text-gray-600 mb-1">Dealer</span>
                      <span className="text-gray-900">{car.tags.dealer || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )};