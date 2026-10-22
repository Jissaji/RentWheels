const { query } = require('../config/db');

// @desc    Get logged in user notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { rows } = await query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY notification_id DESC LIMIT 30`,
      [userId]
    );

    const unreadCount = rows.filter(n => !n.is_read).length;

    res.status(200).json({
      success: true,
      count: rows.length,
      unreadCount,
      notifications: rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    await query(
      `UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?`,
      [id, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    await query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
