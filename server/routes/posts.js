const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth, optionalAuth } = require('../middleware/auth');
const { createPostLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to create slug
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Validation rules
const postValidation = [
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title must be between 1-200 characters'),
  body('content').isLength({ min: 1 }).withMessage('Content is required'),
  body('excerpt').optional().isLength({ max: 300 }).withMessage('Excerpt must be less than 300 characters'),
  body('published').optional().isBoolean().withMessage('Published must be a boolean')
];

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 posts per page
    const skip = (page - 1) * limit;
    const published = req.query.published !== 'false'; // Default to true

    const where = {
      ...(published && { published: true }),
      ...(!published && req.user && { authorId: req.user.id }) // Only show unpublished posts to author
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count({ where })
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.json({
      message: 'Posts retrieved successfully',
      posts,
      pagination
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post with the specified ID was not found'
      });
    }

    // Check if user can view unpublished post
    if (!post.published && (!req.user || req.user.id !== post.authorId)) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post with the specified ID was not found'
      });
    }

    res.json({
      message: 'Post retrieved successfully',
      post
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', auth, createPostLimiter, postValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, excerpt, published = false } = req.body;
    
    // Create unique slug
    let slug = createSlug(title);
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt,
        slug,
        published,
        publishedAt: published ? new Date() : null,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (Author only)
router.put('/:id', auth, postValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, content, excerpt, published } = req.body;

    // Check if post exists and user is author
    const existingPost = await prisma.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post with the specified ID was not found'
      });
    }

    if (existingPost.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own posts'
      });
    }

    // Update slug if title changed
    let slug = existingPost.slug;
    if (title && title !== existingPost.title) {
      slug = createSlug(title);
      const slugExists = await prisma.post.findFirst({
        where: { slug, id: { not: id } }
      });
      
      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(published !== undefined && { 
        published,
        publishedAt: published && !existingPost.published ? new Date() : existingPost.publishedAt
      }),
      slug
    };

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (Author only)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post with the specified ID was not found'
      });
    }

    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own posts'
      });
    }

    await prisma.post.delete({
      where: { id }
    });

    res.json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike post
// @access  Private
router.post('/:id/like', auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post with the specified ID was not found'
      });
    }

    // Check if user already liked the post
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: req.user.id
        }
      }
    });

    let liked;
    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      liked = false;
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          postId: id,
          userId: req.user.id
        }
      });
      liked = true;
    }

    res.json({
      message: liked ? 'Post liked successfully' : 'Post unliked successfully',
      liked
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add comment to post
// @access  Private
router.post('/:id/comments', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Comment content is required'
      });
    }

    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post with the specified ID was not found'
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: id,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
