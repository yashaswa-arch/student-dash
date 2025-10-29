const express = require('express');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/modules/course/:courseId
// @desc    Get all modules for a course
// @access  Private
router.get('/course/:courseId', auth, validateObjectId('courseId'), async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Check if user has access to this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const modules = await Module.find({ course: courseId })
      .sort({ order: 1 })
      .lean();

    // Get lesson counts for each module
    for (const module of modules) {
      const lessonCount = await Lesson.countDocuments({ module: module._id });
      module.lessonCount = lessonCount;
    }

    res.json({
      success: true,
      data: { modules }
    });

  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching modules',
      error: error.message
    });
  }
});

// @route   GET /api/modules/:id/lessons
// @desc    Get all lessons for a module
// @access  Private
router.get('/:id/lessons', auth, validateObjectId('id'), async (req, res) => {
  try {
    const moduleId = req.params.id;

    const lessons = await Lesson.find({ module: moduleId })
      .sort({ order: 1 });

    res.json({
      success: true,
      data: { lessons }
    });

  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lessons',
      error: error.message
    });
  }
});

// @route   GET /api/modules/:moduleId/lessons/:lessonId
// @desc    Get specific lesson content
// @access  Private
router.get('/:moduleId/lessons/:lessonId', auth, async (req, res) => {
  try {
    const { moduleId, lessonId } = req.params;

    const lesson = await Lesson.findOne({
      _id: lessonId,
      module: moduleId
    }).populate('module', 'title course');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    res.json({
      success: true,
      data: { lesson }
    });

  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lesson',
      error: error.message
    });
  }
});

// @route   POST /api/modules (Instructor/Admin only)
// @desc    Create a new module
// @access  Private
router.post('/', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { title, description, course, order, prerequisites } = req.body;

    // Validate required fields
    if (!title || !course) {
      return res.status(400).json({
        success: false,
        message: 'Title and course are required'
      });
    }

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const module = await Module.create({
      title,
      description,
      course,
      order: order || 1,
      prerequisites: prerequisites || []
    });

    await module.populate('course', 'title');

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: { module }
    });

  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating module',
      error: error.message
    });
  }
});

// @route   POST /api/modules/:moduleId/lessons (Instructor/Admin only)
// @desc    Create a new lesson in a module
// @access  Private
router.post('/:moduleId/lessons', auth, authorize('instructor', 'admin'), validateObjectId('moduleId'), async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const { title, type, content, order, estimatedDuration } = req.body;

    // Validate required fields
    if (!title || !type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, type, and content are required'
      });
    }

    // Check if module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const lesson = await Lesson.create({
      title,
      type,
      content,
      module: moduleId,
      order: order || 1,
      estimatedDuration: estimatedDuration || 30
    });

    await lesson.populate('module', 'title course');

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: { lesson }
    });

  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lesson',
      error: error.message
    });
  }
});

module.exports = router;