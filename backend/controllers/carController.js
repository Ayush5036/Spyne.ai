const Car = require('../models/carModel');
const cloudinary = require('cloudinary').v2;

exports.createCar = async (req, res) => {
  try {
    const { title, description} = req.body;
    const tags= JSON.parse(req.body.tags)
    const images = req.files;

    if (!images || images.length > 10) {
      return res.status(400).json({
        message: 'Please provide 1-10 images'
      });
    }

    const uploadedImages = [];
    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: 'cars'
      });
      uploadedImages.push({
        public_id: result.public_id,
        url: result.secure_url
      });
    }

   
    const car = await Car.create({
      title,
      description,
      images: uploadedImages,
      tags,
      user: req.user._id
    });


    res.status(201).json({
      success: true,
      car
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCars = async (req, res) => {
  try {
    const keyword = req.query.search || '';
    const query = {
      user: req.user._id,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { 'tags.car_type': { $regex: keyword, $options: 'i' } },
        { 'tags.company': { $regex: keyword, $options: 'i' } },
        { 'tags.dealer': { $regex: keyword, $options: 'i' } }
      ]
    };

    const cars = await Car.find(query);
    res.status(200).json({
      success: true,
      cars
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCarDetails = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this car' });
    }

    res.status(200).json({
      success: true,
      car
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Backend: carController.js
exports.updateCar = async (req, res) => {
  try {
    console.log(req.body);
    
    let car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    if (car.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this car' });
    }

    // Initialize update object with only the fields that are provided
    const updateFields = {};

    if(req.body.deletedImages)
      req.body.deletedImages=JSON.parse(req.body.deletedImages)
    // Copy only the provided fields from req.body
    Object.keys(req.body).forEach(key => {
      if (key !== 'deletedImages') {
        updateFields[key] = req.body[key];
      }
    });

    // Parse the tags if it exists and is a string
    if (req.body.tags) {
      updateFields.tags = JSON.parse(req.body.tags);
    }

    // Handle image updates only if there are image-related changes
    if (req.body.deletedImages?.length > 0 || req.files?.length > 0) {
      const updatedImages = [...car.images];

      // Handle image deletions if any
      if (req.body.deletedImages?.length > 0) {
        for (const imageId of req.body.deletedImages) {
          const imageIndex = updatedImages.findIndex(img => img.public_id === imageId);
          if (imageIndex !== -1) {
            // Delete from Cloudinary
            await cloudinary.uploader.destroy(updatedImages[imageIndex].public_id);
            // Remove from array
            updatedImages.splice(imageIndex, 1);
          }
        }
      }

      // Handle new images if any
      if (req.files?.length > 0) {
        const newUploadedImages = await Promise.all(
          req.files.map(file => 
            cloudinary.uploader.upload(file.path, {
              folder: 'cars'
            })
          )
        );

        const formattedNewImages = newUploadedImages.map(result => ({
          public_id: result.public_id,
          url: result.secure_url
        }));

        updatedImages.push(...formattedNewImages);
      }

      // Only add images field if there were changes
      updateFields.images = updatedImages;
    }

    // Only perform update if there are fields to update
    if (Object.keys(updateFields).length > 0) {
      car = await Car.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        {
          new: true,
          runValidators: true
        }
      );

      return res.status(200).json({
        success: true,
        car
      });
    } else {
      // If no fields to update, return the existing car
      return res.status(200).json({
        success: true,
        message: 'No updates provided',
        car
      });
    }

  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ 
        success: false, 
        message: 'Car not found' 
      });
    }

    // Check if user is authorized
    if (car.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this car' 
      });
    }

    // Delete images from cloudinary
    try {
      for (const image of car.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with car deletion even if image deletion fails
    }

    // Use deleteOne() instead of remove()
    await Car.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully'
    });

  } catch (error) {
    console.error('Delete car error:', error); // Add detailed logging
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete car',
      error: error.message 
    });
  }
};


exports.getCars = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    // Build the search query
    const searchRegex = new RegExp(search, 'i');
    const query = {
      $or: [
        { title: searchRegex },
        { 'tags.car_type': searchRegex },
        { 'tags.company': searchRegex },
        { 'tags.dealer': searchRegex }
      ]
    };

    const cars = await Car.paginate(query, options);
    res.status(200).json(cars);
  } catch (error) {
    console.error('Error getting cars:', error);
    res.status(500).json({ message: 'Error getting cars' });
  }
};