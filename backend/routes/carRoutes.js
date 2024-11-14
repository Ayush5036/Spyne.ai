const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { 
  createCar, 
  getAllCars, 
  getCarDetails, 
  updateCar, 
  deleteCar 
} = require('../controllers/carController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.route('/new').post(isAuthenticatedUser, upload.array('images', 10), createCar);
router.route('/all').get(isAuthenticatedUser, getAllCars);
router.route('/:id')
  .get(isAuthenticatedUser, getCarDetails)
  .patch(isAuthenticatedUser, upload.array('images', 10), updateCar)
  .delete(isAuthenticatedUser, deleteCar);

module.exports = router;