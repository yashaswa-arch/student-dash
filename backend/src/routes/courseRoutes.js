const express = require('express');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');
const { validateCourse, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (req.query.instructor) {
      query.instructor = req.query.instructor;
    }
    if (req.query.tag) {
      query.tags = { $in: [req.query.tag] };
    }
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private/Instructor
router.post('/', auth, authorize('instructor', 'admin'), validateCourse, async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    const course = await Course.create({
      title,
      description,
      instructor: req.user._id,
      tags: tags || []
    });

    await course.populate('instructor', 'name email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email profilePicUrl');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private/Instructor (own courses) or Admin
router.put('/:id', auth, authorize('instructor', 'admin'), validateObjectId('id'), validateCourse, async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor of this course or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own courses.'
      });
    }

    const { title, description, tags } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags) updateData.tags = tags;

    course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private/Instructor (own courses) or Admin
router.delete('/:id', auth, authorize('instructor', 'admin'), validateObjectId('id'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor of this course or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own courses.'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
});

// @route   GET /api/courses/instructor/my-courses
// @desc    Get courses created by the authenticated instructor
// @access  Private/Instructor
router.get('/instructor/my-courses', auth, authorize('instructor', 'admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments({ instructor: req.user._id });

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching instructor courses',
      error: error.message
    });
  }
});

// @route   GET /api/courses/tags/popular
// @desc    Get popular course tags
// @access  Public
router.get('/tags/popular', async (req, res) => {
  try {
    const tags = await Course.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular tags',
      error: error.message
    });
  }
});

module.exports = router;