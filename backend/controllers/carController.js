const CarModel = require('../models/carModel');
const BookingModel = require('../models/bookingModel');

// @desc    Get all cars with filters and search
// @route   GET /api/cars
// @access  Public
const getAllCars = async (req, res, next) => {
  try {
    const {
      search,
      brand,
      category,
      fuel_type,
      transmission,
      seats,
      min_price,
      max_price,
      status,
      pickup_date,
      return_date,
      sort_by
    } = req.query;

    const cars = await CarModel.getAll({
      search,
      brand,
      category,
      fuel_type,
      transmission,
      seats,
      min_price,
      max_price,
      status,
      pickup_date,
      return_date,
      sort_by
    });

    res.status(200).json({
      success: true,
      count: cars.length,
      cars
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured cars for landing page
// @route   GET /api/cars/featured
// @access  Public
const getFeaturedCars = async (req, res, next) => {
  try {
    const cars = await CarModel.getFeatured();
    res.status(200).json({
      success: true,
      cars
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single car details
// @route   GET /api/cars/:id
// @access  Public
const getCarById = async (req, res, next) => {
  try {
    const car = await CarModel.getById(req.params.id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found with the specified ID.'
      });
    }

    res.status(200).json({
      success: true,
      car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check car availability for date range
// @route   GET /api/cars/:id/check-availability
// @access  Public
const checkAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pickup_date, return_date } = req.query;

    if (!pickup_date || !return_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both pickup_date and return_date.'
      });
    }

    const car = await CarModel.getById(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.'
      });
    }

    if (car.status === 'Maintenance') {
      return res.status(200).json({
        success: true,
        available: false,
        reason: 'This vehicle is currently undergoing scheduled maintenance.'
      });
    }

    if (car.status === 'Inactive') {
      return res.status(200).json({
        success: true,
        available: false,
        reason: 'This vehicle is currently decommissioned / inactive.'
      });
    }

    const overlapping = await BookingModel.checkOverlap(id, pickup_date, return_date);
    const available = overlapping.length === 0;

    res.status(200).json({
      success: true,
      available,
      overlappingCount: overlapping.length,
      reason: available ? 'Vehicle is available for the selected dates.' : 'Vehicle is already reserved on these dates.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get car booking history
// @route   GET /api/cars/:id/bookings
// @access  Private (Admin/Staff)
const getCarBookingHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const car = await CarModel.getById(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.'
      });
    }

    const bookings = await CarModel.getBookingsHistory(id);
    res.status(200).json({
      success: true,
      car,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new car
// @route   POST /api/cars
// @access  Private (Admin)
const createCar = async (req, res, next) => {
  try {
    const {
      brand,
      model,
      registration_number,
      year,
      category = 'Sedan',
      fuel_type,
      transmission,
      seats,
      mileage,
      price_per_day,
      image,
      description,
      status,
      is_featured
    } = req.body;

    // Validation
    if (!brand || !model || !registration_number || !year || !fuel_type || !transmission || !seats || !price_per_day || !image) {
      return res.status(400).json({
        success: false,
        message: 'All core car specifications including brand, model, registration number, year, fuel type, transmission, seats, price per day, and image URL are required.'
      });
    }

    if (parseFloat(price_per_day) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price per day must be greater than zero.'
      });
    }

    const existing = await CarModel.findByRegistrationNumber(registration_number.trim().toUpperCase());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A car with registration number "${registration_number}" already exists in the fleet.`
      });
    }

    const carId = await CarModel.create({
      brand: brand.trim(),
      model: model.trim(),
      registration_number: registration_number.trim().toUpperCase(),
      year: parseInt(year),
      category: category || 'Sedan',
      fuel_type,
      transmission,
      seats: parseInt(seats),
      mileage: mileage || '16 km/l',
      price_per_day: parseFloat(price_per_day),
      image: image.trim(),
      description: description || '',
      status: status || 'Available',
      is_featured: is_featured ? 1 : 0
    });

    const newCar = await CarModel.getById(carId);

    res.status(201).json({
      success: true,
      message: 'New car successfully added to the fleet!',
      car: newCar
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update car details
// @route   PUT /api/cars/:id
// @access  Private (Admin)
const updateCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await CarModel.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.'
      });
    }

    const {
      brand,
      model,
      registration_number,
      year,
      category,
      fuel_type,
      transmission,
      seats,
      mileage,
      price_per_day,
      image,
      description,
      status,
      is_featured
    } = req.body;

    if (registration_number && registration_number.trim().toUpperCase() !== existing.registration_number) {
      const regCheck = await CarModel.findByRegistrationNumber(registration_number.trim().toUpperCase());
      if (regCheck && regCheck.car_id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: `Another vehicle with registration number "${registration_number}" already exists.`
        });
      }
    }

    const updatedCar = await CarModel.update(id, {
      brand: brand || existing.brand,
      model: model || existing.model,
      registration_number: registration_number ? registration_number.trim().toUpperCase() : existing.registration_number,
      year: year ? parseInt(year) : existing.year,
      category: category || existing.category || 'Sedan',
      fuel_type: fuel_type || existing.fuel_type,
      transmission: transmission || existing.transmission,
      seats: seats ? parseInt(seats) : existing.seats,
      mileage: mileage !== undefined ? mileage : existing.mileage,
      price_per_day: price_per_day ? parseFloat(price_per_day) : existing.price_per_day,
      image: image || existing.image,
      description: description !== undefined ? description : existing.description,
      status: status || existing.status,
      is_featured: is_featured !== undefined ? is_featured : existing.is_featured
    });

    res.status(200).json({
      success: true,
      message: 'Car details updated successfully!',
      car: updatedCar
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or deactivate car
// @route   DELETE /api/cars/:id
// @access  Private (Admin)
const deleteCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const car = await CarModel.getById(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.'
      });
    }

    const result = await CarModel.delete(id);
    res.status(200).json({
      success: true,
      message: result.message,
      softDeleted: result.softDeleted
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCars,
  getFeaturedCars,
  getCarById,
  checkAvailability,
  getCarBookingHistory,
  createCar,
  updateCar,
  deleteCar
};
