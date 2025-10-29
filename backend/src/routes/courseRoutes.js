const express = require('express');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
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

// ===== MVP COURSE MANAGEMENT FEATURES =====

// @route   POST /api/courses/:id/enroll
// @desc    Enroll student in a course
// @access  Private (Students)
router.post('/:id/enroll', auth, validateObjectId('id'), async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingProgress = await Progress.findOne({
      user: userId,
      course: courseId
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create progress entry (enrollment)
    const progress = await Progress.create({
      user: userId,
      course: courseId,
      status: 'in_progress',
      overallProgress: 0,
      startedAt: new Date()
    });

    await progress.populate('course', 'title description instructor');

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: { progress }
    });

  } catch (error) {
    console.error('Course enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: error.message
    });
  }
});

// @route   GET /api/courses/my-courses
// @desc    Get user's enrolled courses
// @access  Private
router.get('/my-courses', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const enrolledCourses = await Progress.find({ user: userId })
      .populate('course', 'title description instructor tags createdAt')
      .populate('course.instructor', 'name email')
      .sort({ startedAt: -1 });

    const formattedCourses = enrolledCourses.map(progress => ({
      courseId: progress.course._id,
      title: progress.course.title,
      description: progress.course.description,
      instructor: progress.course.instructor,
      tags: progress.course.tags,
      enrolledAt: progress.startedAt,
      progress: progress.overallProgress,
      status: progress.status,
      lastAccessed: progress.lastAccessed,
      completedAt: progress.completedAt
    }));

    res.json({
      success: true,
      data: { 
        enrolledCourses: formattedCourses,
        totalCourses: formattedCourses.length
      }
    });

  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrolled courses',
      error: error.message
    });
  }
});

// @route   GET /api/courses/:id/progress
// @desc    Get user's progress in a specific course
// @access  Private
router.get('/:id/progress', auth, validateObjectId('id'), async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    // Get user's progress
    const progress = await Progress.findOne({
      user: userId,
      course: courseId
    }).populate('course', 'title description');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Get course modules and lessons
    const modules = await Module.find({ course: courseId })
      .sort({ order: 1 });

    const moduleProgress = [];
    for (const module of modules) {
      const lessons = await Lesson.find({ module: module._id })
        .sort({ order: 1 });

      const completedLessons = progress.completedLessons || [];
      const lessonProgress = lessons.map(lesson => ({
        _id: lesson._id,
        title: lesson.title,
        type: lesson.type,
        order: lesson.order,
        completed: completedLessons.includes(lesson._id.toString())
      }));

      moduleProgress.push({
        _id: module._id,
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: lessonProgress,
        completedLessons: lessonProgress.filter(l => l.completed).length,
        totalLessons: lessonProgress.length
      });
    }

    res.json({
      success: true,
      data: {
        courseId: progress.course._id,
        courseTitle: progress.course.title,
        overallProgress: progress.overallProgress,
        status: progress.status,
        startedAt: progress.startedAt,
        lastAccessed: progress.lastAccessed,
        completedAt: progress.completedAt,
        modules: moduleProgress
      }
    });

  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course progress',
      error: error.message
    });
  }
});

// @route   POST /api/courses/:courseId/lessons/:lessonId/complete
// @desc    Mark a lesson as completed
// @access  Private
router.post('/:courseId/lessons/:lessonId/complete', auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;

    // Get user's progress
    const progress = await Progress.findOne({
      user: userId,
      course: courseId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Check if lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Add lesson to completed list if not already completed
    const completedLessons = progress.completedLessons || [];
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    // Calculate overall progress
    const totalLessons = await Lesson.countDocuments({
      module: { $in: await Module.find({ course: courseId }).distinct('_id') }
    });
    
    const overallProgress = Math.round((completedLessons.length / totalLessons) * 100);

    // Update progress
    const updatedProgress = await Progress.findByIdAndUpdate(
      progress._id,
      {
        completedLessons,
        overallProgress,
        lastAccessed: new Date(),
        ...(overallProgress === 100 && { 
          status: 'completed',
          completedAt: new Date()
        })
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Lesson marked as completed',
      data: {
        lessonId,
        overallProgress: updatedProgress.overallProgress,
        status: updatedProgress.status,
        completedLessons: updatedProgress.completedLessons.length,
        totalLessons
      }
    });

  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing lesson',
      error: error.message
    });
  }
});

module.exports = router;