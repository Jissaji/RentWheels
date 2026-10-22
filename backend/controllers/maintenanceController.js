const MaintenanceModel = require('../models/maintenanceModel');
const CarModel = require('../models/carModel');

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private (Admin)
const getAllMaintenance = async (req, res, next) => {
  try {
    const { car_id, status } = req.query;
    const records = await MaintenanceModel.getAll({ car_id, status });
    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create maintenance record
// @route   POST /api/maintenance
// @access  Private (Admin)
const createMaintenance = async (req, res, next) => {
  try {
    const { car_id, maintenance_type, description, start_date, end_date, cost, status } = req.body;

    if (!car_id || !maintenance_type || !description || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'Car ID, maintenance type, description, and start date are required.'
      });
    }

    const car = await CarModel.getById(car_id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.'
      });
    }

    const maintenance_id = await MaintenanceModel.create({
      car_id: parseInt(car_id),
      maintenance_type,
      description,
      start_date,
      end_date: end_date || null,
      cost: cost ? parseFloat(cost) : 0.00,
      status: status || 'Scheduled'
    });

    const record = await MaintenanceModel.getById(maintenance_id);

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully.',
      record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance record
// @route   PUT /api/maintenance/:id
// @access  Private (Admin)
const updateMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await MaintenanceModel.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found.'
      });
    }

    const { car_id, maintenance_type, description, start_date, end_date, cost, status } = req.body;

    const updated = await MaintenanceModel.update(id, {
      car_id: car_id || existing.car_id,
      maintenance_type: maintenance_type || existing.maintenance_type,
      description: description || existing.description,
      start_date: start_date || existing.start_date,
      end_date: end_date !== undefined ? end_date : existing.end_date,
      cost: cost !== undefined ? parseFloat(cost) : existing.cost,
      status: status || existing.status
    });

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully.',
      record: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Private (Admin)
const deleteMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await MaintenanceModel.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found.'
      });
    }

    await MaintenanceModel.delete(id);
    res.status(200).json({
      success: true,
      message: 'Maintenance record removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMaintenance,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance
};
