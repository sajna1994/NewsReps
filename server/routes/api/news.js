const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// Bring in Models
const News = require('../../models/news');

// @route   GET api/news
// @desc    Get all news articles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const news = await News.find({})  // ← Changed from { isPublished: true } to {}
            .populate('author', 'firstName lastName')
            .sort({ publishedDate: -1 });

        res.status(200).json({
            success: true,
            news
        });
    } catch (error) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});

// @route   GET api/news/featured
// @desc    Get featured news articles
// @access  Public
router.get('/featured', async (req, res) => {
    try {
        const featuredNews = await News.find({
            isFeatured: true
        })
            .populate('author', 'firstName lastName')
            .sort({ publishedDate: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            news: featuredNews
        });
    } catch (error) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});
// @route   GET api/news/featured/today
// @desc    Get today's featured news articles
// @access  Public
// @route   GET api/news/featured/today
// @desc    Get today's featured news or latest published news
// @access  Public
router.get('/featured/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // First, try to get today's featured news
        let featuredNews = await News.find({
            isPublished: true,
            isFeatured: true,
            publishedDate: {
                $gte: today,
                $lt: tomorrow
            }
        })
            .populate('author', 'firstName lastName')
            .sort({ publishedDate: -1 })
            .limit(5);

        // If no featured news today, get latest published news
        if (!featuredNews || featuredNews.length === 0) {
            featuredNews = await News.find({
                isPublished: true
            })
                .populate('author', 'firstName lastName')
                .sort({ publishedDate: -1 })
                .limit(5);
        }

        res.status(200).json({
            success: true,
            news: featuredNews
        });
    } catch (error) {
        console.error('Error fetching today\'s featured news:', error);
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});
// @route   GET api/news/:id
// @desc    Get single news article
// @access  Public
// server/routes/news.js


// @route   GET api/news/:newsId
// @desc    Get a single news article with questions
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id)
            .populate('author', 'firstName lastName')
            .lean(); // Use lean() for better performance

        if (!news) {
            return res.status(404).json({
                success: false,
                error: 'News article not found'
            });
        }

        // Increment view count
        await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

        res.status(200).json({
            success: true,
            news: news
        });
    } catch (error) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});



// @route   POST api/news
// @desc    Create news article
// @access  Private (Admin/Author)
// @route   POST api/news
// @desc    Create news article
// @access  Private (Admin/Author)
// @route   POST api/news
// @desc    Create news article
// @access  Private (Admin/Author)
router.post('/', auth, async (req, res) => {
    try {
        console.log('=== CREATE NEWS REQUEST ===');
        console.log('User ID:', req.user.id);
        console.log('User role:', req.user.role);
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const {
            title,
            content,
            summary,
            category,
            imageUrl,
            source,
            questions,
            difficulty,
            tags,
            isPublished,
            isFeatured
        } = req.body;

        // Log each field
        console.log('Title:', title);
        console.log('Content length:', content ? content.length : 0);
        console.log('Category:', category);
        console.log('Tags:', tags);
        console.log('isPublished:', isPublished);
        console.log('isFeatured:', isFeatured);

        if (!title || !content) {
            return res.status(400).json({
                error: 'Title and content are required.'
            });
        }

        // Convert tags
        let tagsArray = [];
        if (tags) {
            if (typeof tags === 'string') {
                tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            } else if (Array.isArray(tags)) {
                tagsArray = tags;
            }
        }

        // Create news object
        const newsData = {
            title: title.trim(),
            content: content.trim(),
            summary: summary ? summary.trim() : '',
            category: category || 'General',
            imageUrl: imageUrl || '',
            source: source || '',
            questions: [],
            difficulty: difficulty || 'Medium',
            tags: tagsArray,
            author: req.user.id,
            isPublished: isPublished || false,  // Don't auto-publish
            isFeatured: isFeatured || false
        };

        console.log('News data to save:', newsData);

        const news = new News(newsData);
        const savedNews = await news.save();

        console.log('=== NEWS SAVED SUCCESSFULLY ===');
        console.log('News ID:', savedNews._id);

        res.status(201).json({
            success: true,
            message: 'News article created successfully!',
            news: savedNews
        });
    } catch (error) {
        console.error('=== ERROR CREATING NEWS ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);

        // Check for validation errors
        if (error.name === 'ValidationError') {
            console.error('Validation errors:', error.errors);
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }

        res.status(400).json({
            error: 'Your request could not be processed. Please try again.',
            details: error.message
        });
    }
});

// @route   PUT api/news/:id
// @desc    Update news article
// @access  Private (Admin/Author)
router.put('/:id', auth, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                error: 'News article not found.'
            });
        }

        // Check if user is author or admin
        if (news.author.toString() !== req.user.id && req.user.role !== 'ROLE ADMIN') {
            return res.status(401).json({
                error: 'Not authorized to update this article.'
            });
        }

        const updatedNews = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'News article updated successfully!',
            news: updatedNews
        });
    } catch (error) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});

// @route   DELETE api/news/:id
// @desc    Delete news article
// @access  Private (Admin/Author)
router.delete('/:id', auth, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                error: 'News article not found.'
            });
        }

        // Check if user is author or admin
        if (news.author.toString() !== req.user.id && req.user.role !== 'ROLE ADMIN') {
            return res.status(401).json({
                error: 'Not authorized to delete this article.'
            });
        }

        await news.remove();

        res.status(200).json({
            success: true,
            message: 'News article deleted successfully!'
        });
    } catch (error) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});

// @route   POST api/news/:id/questions
// @desc    Add question to news article
// @access  Private (Admin/Author)
// Add these routes after your existing routes

// @route   GET api/news/:id/questions
// @desc    Get all questions for a news article
// @access  Public
router.get('/:id/questions', async (req, res) => {
    try {
        const news = await News.findById(req.params.id)
            .select('questions title');

        if (!news) {
            return res.status(404).json({
                error: 'News article not found.'
            });
        }

        res.status(200).json({
            success: true,
            questions: news.questions
        });
    } catch (error) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});
router.post('/:newsId/questions', auth, async (req, res) => {
    try {
        console.log('Received request to add question to news:', req.params.newsId);
        console.log('Question data:', req.body);

        const { newsId } = req.params;
        const { question, options, correctAnswer, explanation } = req.body;

        // Validate required fields
        if (!question || !options || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a question and at least 2 options'
            });
        }

        if (correctAnswer === undefined || correctAnswer < 0 || correctAnswer >= options.length) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid correct answer index'
            });
        }

        // Find the news article
        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({
                success: false,
                error: 'News article not found'
            });
        }

        // Check if user is authorized (admin or the author)
        if (req.user.role !== 'ROLE ADMIN' && news.author.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to add questions to this news article'
            });
        }

        // Create question object
        const questionData = {
            question: question.trim(),
            options: options.map(opt => opt.trim()),
            correctAnswer: parseInt(correctAnswer),
            explanation: explanation ? explanation.trim() : '',
            createdAt: new Date()
        };

        // Initialize questions array if it doesn't exist
        if (!news.questions) {
            news.questions = [];
        }

        // Add question to news
        news.questions.push(questionData);
        await news.save();

        console.log('Question added successfully to news:', newsId);

        res.status(200).json({
            success: true,
            message: 'Question added successfully',
            news: news
        });

    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while adding question'
        });
    }
});

// @route   DELETE api/news/:id/questions/:questionIndex
// @desc    Delete a question from news article
// @access  Private (Admin/Author)
router.delete('/:id/questions/:questionIndex', auth, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                error: 'News article not found.'
            });
        }

        // Check if user is author or admin
        if (news.author.toString() !== req.user.id && req.user.role !== 'ROLE ADMIN') {
            return res.status(401).json({
                error: 'Not authorized to delete questions from this article.'
            });
        }

        const questionIndex = parseInt(req.params.questionIndex);

        if (questionIndex < 0 || questionIndex >= news.questions.length) {
            return res.status(400).json({
                error: 'Invalid question index.'
            });
        }

        // Remove the question
        news.questions.splice(questionIndex, 1);
        await news.save();

        res.status(200).json({
            success: true,
            message: 'Question deleted successfully!',
            questions: news.questions
        });
    } catch (error) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});
// server/routes/news.js - Add this route
// @route   GET api/news/today
// @desc    Get today's news articles
// @access  Public
// server/routes/news.js - Update the today route
// server/routes/news.js - Update the today route
// server/routes/news.js - TEMPORARY FIX
// server/routes/news.js - Update the /today route
// server/routes/news.js - SIMPLIFIED /today route
router.get('/today', async (req, res) => {
    try {
        console.log('Today\'s news endpoint called');

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        console.log('Looking for news between:', today, 'and', tomorrow);

        // Find news published today
        const news = await News.find({
            publishedDate: {
                $gte: today,
                $lt: tomorrow
            }
        })
            .populate('author', 'firstName lastName')
            .sort({ publishedDate: -1 });

        console.log('Found', news.length, 'news articles today');

        res.status(200).json({
            success: true,
            news: news,
            count: news.length,
            message: `Found ${news.length} news articles for today`
        });

    } catch (error) {
        console.error('Error in today\'s news endpoint:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// @route   PUT api/news/:id/questions/:questionIndex
// @desc    Update a question in news article
// @access  Private (Admin/Author)
router.put('/:id/questions/:questionIndex', auth, async (req, res) => {
    try {
        const { question, options, correctAnswer, explanation } = req.body;
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                error: 'News article not found.'
            });
        }

        // Check if user is author or admin
        if (news.author.toString() !== req.user.id && req.user.role !== 'ROLE ADMIN') {
            return res.status(401).json({
                error: 'Not authorized to update questions in this article.'
            });
        }

        const questionIndex = parseInt(req.params.questionIndex);

        if (questionIndex < 0 || questionIndex >= news.questions.length) {
            return res.status(400).json({
                error: 'Invalid question index.'
            });
        }

        // Update the question
        news.questions[questionIndex] = {
            question,
            options,
            correctAnswer,
            explanation
        };

        await news.save();

        res.status(200).json({
            success: true,
            message: 'Question updated successfully!',
            questions: news.questions
        });
    } catch (error) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});

module.exports = router;