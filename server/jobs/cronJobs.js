const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to initialize all scheduled tasks
const scheduledTasks = () => {
  console.log('🕐 Initializing scheduled tasks...');

  // Daily cleanup task - runs every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🧹 Running daily cleanup tasks...');
    
    try {
      // Clean up old sessions, logs, etc.
      // Add your cleanup logic here
      
      console.log('✅ Daily cleanup completed successfully');
    } catch (error) {
      console.error('❌ Daily cleanup failed:', error);
    }
  }, {
    timezone: "UTC"
  });

  // Weekly statistics task - runs every Sunday at 3 AM
  cron.schedule('0 3 * * 0', async () => {
    console.log('📊 Generating weekly statistics...');
    
    try {
      const stats = await generateWeeklyStats();
      console.log('📈 Weekly stats:', stats);
      
      // You can send these stats to admin emails, save to database, etc.
      
      console.log('✅ Weekly statistics generated successfully');
    } catch (error) {
      console.error('❌ Weekly statistics generation failed:', error);
    }
  }, {
    timezone: "UTC"
  });

  // Health check task - runs every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      // You can add more health checks here
      // - Check external API connections
      // - Check file system health
      // - Check memory usage, etc.
      
      console.log('💚 Health check passed');
    } catch (error) {
      console.error('💔 Health check failed:', error);
      
      // You can implement alerting here
      // - Send notification to admin
      // - Log to monitoring service
    }
  });

  console.log('✅ All scheduled tasks initialized');
};

// Helper function to generate weekly statistics
const generateWeeklyStats = async () => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisWeek,
    totalPosts,
    newPostsThisWeek,
    totalComments,
    newCommentsThisWeek,
    totalLikes,
    newLikesThisWeek
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    }),
    prisma.post.count(),
    prisma.post.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    }),
    prisma.comment.count(),
    prisma.comment.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    }),
    prisma.like.count(),
    prisma.like.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })
  ]);

  return {
    users: {
      total: totalUsers,
      newThisWeek: newUsersThisWeek
    },
    posts: {
      total: totalPosts,
      newThisWeek: newPostsThisWeek
    },
    comments: {
      total: totalComments,
      newThisWeek: newCommentsThisWeek
    },
    likes: {
      total: totalLikes,
      newThisWeek: newLikesThisWeek
    },
    generatedAt: new Date().toISOString()
  };
};

// Export individual task functions for testing
const tasks = {
  generateWeeklyStats
};

module.exports = {
  scheduledTasks,
  tasks
};
