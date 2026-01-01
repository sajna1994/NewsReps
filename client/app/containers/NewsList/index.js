// app/containers/NewsList/index.js
import React from 'react';
import { connect } from 'react-redux';
import {
    Row, Col, Card, CardBody, CardTitle, CardText,
    Button, Badge, Alert, Container, Input, FormGroup, Label
} from 'reactstrap';
import { Link } from 'react-router-dom';

import { fetchNews } from '../News/actions';

import LoadingIndicator from '../../components/Common/LoadingIndicator';

class NewsList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            filter: 'all', // 'all', 'today', 'week', 'month'
            searchQuery: '',
            categoryFilter: 'all',
            sortBy: 'newest' // 'newest', 'oldest', 'mostViewed'
        };
    }

    componentDidMount() {
        this.props.fetchNews();
    }

    filterNews = (news) => {
        const { filter, searchQuery, categoryFilter } = this.state;
        let filtered = [...news];

        // Filter by time period
        if (filter !== 'all') {
            const now = new Date();
            let startDate = new Date();

            if (filter === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (filter === 'week') {
                startDate.setDate(now.getDate() - 7);
            } else if (filter === 'month') {
                startDate.setMonth(now.getMonth() - 1);
            }

            filtered = filtered.filter(item =>
                new Date(item.publishedDate) >= startDate
            );
        }

        // Filter by category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category === categoryFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.content.toLowerCase().includes(query) ||
                item.summary.toLowerCase().includes(query) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }

        return filtered;
    };

    sortNews = (news) => {
        const { sortBy } = this.state;

        switch (sortBy) {
            case 'newest':
                return [...news].sort((a, b) =>
                    new Date(b.publishedDate) - new Date(a.publishedDate)
                );

            case 'oldest':
                return [...news].sort((a, b) =>
                    new Date(a.publishedDate) - new Date(b.publishedDate)
                );

            case 'mostViewed':
                return [...news].sort((a, b) =>
                    (b.views || 0) - (a.views || 0)
                );

            default:
                return news;
        }
    };

    getUniqueCategories = (news) => {
        const categories = news.map(item => item.category).filter(Boolean);
        return ['all', ...new Set(categories)];
    };

    handleSearchChange = (e) => {
        this.setState({ searchQuery: e.target.value });
    };

    handleCategoryChange = (category) => {
        this.setState({ categoryFilter: category });
    };

    handleSortChange = (e) => {
        this.setState({ sortBy: e.target.value });
    };

    renderNewsCard = (news) => {
        return (
            <Col key={news._id} lg={4} md={6} className='mb-4'>
                <Card className='h-100 news-card shadow-sm'>
                    {news.imageUrl && (
                        <img
                            src={news.imageUrl}
                            alt={news.title}
                            className='card-img-top'
                            style={{ height: '200px', objectFit: 'cover' }}
                        />
                    )}
                    <CardBody>
                        <div className='d-flex justify-content-between align-items-start mb-2'>
                            <Badge color="primary" pill>{news.category || 'General'}</Badge>
                            <div>
                                <Badge color={
                                    news.difficulty === 'Hard' ? 'danger' :
                                        news.difficulty === 'Medium' ? 'warning' : 'success'
                                } pill className='mr-1'>
                                    {news.difficulty || 'Medium'}
                                </Badge>
                                <Badge color="info" pill>
                                    <i className="far fa-eye mr-1"></i>
                                    {news.views || 0}
                                </Badge>
                            </div>
                        </div>

                        <CardTitle tag="h5" className='mb-2'>
                            <Link to={`/news/${news._id}`} className='text-dark text-decoration-none'>
                                {news.title}
                            </Link>
                        </CardTitle>

                        <CardText className='text-muted small mb-3'>
                            {news.summary || (news.content && news.content.substring(0, 150)) || 'No summary available'}...
                        </CardText>

                        <div className='d-flex justify-content-between align-items-center mb-3'>
                            <small className='text-muted'>
                                <i className="far fa-clock mr-1"></i>
                                {new Date(news.publishedDate).toLocaleDateString()}
                            </small>
                            <Badge color={news.questions && news.questions.length > 0 ? 'success' : 'secondary'} pill>
                                <i className="far fa-question-circle mr-1"></i>
                                {news.questions ? news.questions.length : 0} Q
                            </Badge>
                        </div>

                        <div className='d-flex justify-content-between'>
                            <Link to={`/news/${news._id}`} className='btn btn-sm btn-outline-primary'>
                                Read Full
                            </Link>
                            {news.questions && news.questions.length > 0 && (
                                <Link to={`/quiz/${news._id}`} className='btn btn-sm btn-success'>
                                    Take Quiz
                                </Link>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </Col>
        );
    };

    renderFilters = () => {
        const { filter, searchQuery, categoryFilter, sortBy } = this.state;
        const { newsList } = this.props;
        const categories = this.getUniqueCategories(newsList || []);

        return (
            <Card className='mb-4'>
                <CardBody>
                    <Row>
                        {/* Search */}
                        <Col md={12} className='mb-3'>
                            <FormGroup>
                                <Label for="search">Search News</Label>
                                <Input
                                    type="text"
                                    id="search"
                                    placeholder="Search by title, content, or tags..."
                                    value={searchQuery}
                                    onChange={this.handleSearchChange}
                                />
                            </FormGroup>
                        </Col>

                        {/* Time Filters */}
                        <Col md={6}>
                            <FormGroup>
                                <Label>Time Period</Label>
                                <div className="time-filters">
                                    {['all', 'today', 'week', 'month'].map(time => (
                                        <Button
                                            key={time}
                                            color={filter === time ? 'primary' : 'light'}
                                            size="sm"
                                            className='mr-2 mb-2'
                                            onClick={() => this.setState({ filter: time })}
                                        >
                                            {time === 'all' ? 'All Time' :
                                                time === 'today' ? 'Today' :
                                                    time === 'week' ? 'This Week' : 'This Month'}
                                        </Button>
                                    ))}
                                </div>
                            </FormGroup>
                        </Col>

                        {/* Category Filters */}
                        <Col md={6}>
                            <FormGroup>
                                <Label>Category</Label>
                                <div className="category-filters">
                                    {categories.map(cat => (
                                        <Button
                                            key={cat}
                                            color={categoryFilter === cat ? 'primary' : 'light'}
                                            size="sm"
                                            className='mr-2 mb-2'
                                            onClick={() => this.handleCategoryChange(cat)}
                                        >
                                            {cat === 'all' ? 'All Categories' : cat}
                                        </Button>
                                    ))}
                                </div>
                            </FormGroup>
                        </Col>

                        {/* Sort Options */}
                        <Col md={12} className='mt-2'>
                            <FormGroup>
                                <Label for="sortBy">Sort By</Label>
                                <Input
                                    type="select"
                                    id="sortBy"
                                    value={sortBy}
                                    onChange={this.handleSortChange}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="mostViewed">Most Viewed</option>
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        );
    };

    renderStats = (filteredNews) => {
        const { newsList } = this.props;
        const totalArticles = newsList?.length || 0;
        const filteredCount = filteredNews.length;
        const articlesWithQuizzes = newsList?.filter(n => n.questions && n.questions.length > 0).length || 0;

        return (
            <div className='news-stats mb-4'>
                <Alert color="info" className='mb-0'>
                    <Row className='align-items-center'>
                        <Col md={3} className='text-center'>
                            <h4 className='mb-0'>{totalArticles}</h4>
                            <small>Total Articles</small>
                        </Col>
                        <Col md={3} className='text-center'>
                            <h4 className='mb-0 text-success'>{articlesWithQuizzes}</h4>
                            <small>With Quizzes</small>
                        </Col>
                        <Col md={3} className='text-center'>
                            <h4 className='mb-0 text-warning'>{filteredCount}</h4>
                            <small>Showing</small>
                        </Col>
                        <Col md={3} className='text-center'>
                            <h4 className='mb-0 text-primary'>
                                {this.getUniqueCategories(newsList || []).length - 1}
                            </h4>
                            <small>Categories</small>
                        </Col>
                    </Row>
                </Alert>
            </div>
        );
    };

    render() {
        const { newsList, isLoading, error } = this.props;

        if (isLoading) {
            return (
                <Container className='py-5'>
                    <LoadingIndicator />
                    <p className="text-center mt-3">Loading news articles...</p>
                </Container>
            );
        }

        if (error) {
            return (
                <Container className='py-5'>
                    <Alert color="danger">
                        <h4>Error loading news</h4>
                        <p>{error}</p>
                        <Button color="primary" onClick={() => this.props.fetchNews()}>
                            Try Again
                        </Button>
                    </Alert>
                </Container>
            );
        }

        if (!newsList || newsList.length === 0) {
            return (
                <Container className='py-5'>
                    <Alert color="info">
                        <h4>No News Articles</h4>
                        <p className="mb-0">There are no news articles available at the moment. Check back soon!</p>
                    </Alert>
                </Container>
            );
        }

        const filteredNews = this.filterNews(newsList);
        const sortedNews = this.sortNews(filteredNews);

        return (
            <Container className='news-list'>
                {/* Header */}
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div>
                        <h1 className='display-5'>Latest News</h1>
                        <p className='lead text-muted'>Stay updated with the latest articles</p>
                    </div>
                    <Link to='/todays-news' className='btn btn-outline-primary'>
                        <i className="fas fa-calendar-day mr-2"></i>
                        Today's News
                    </Link>
                </div>

                {/* Stats */}
                {this.renderStats(filteredNews)}

                {/* Filters */}
                {this.renderFilters()}

                {/* News Grid */}
                {sortedNews.length > 0 ? (
                    <Row>
                        {sortedNews.map(news => this.renderNewsCard(news))}
                    </Row>
                ) : (
                    <Alert color="warning" className='text-center py-5'>
                        <h4>No articles found</h4>
                        <p className="mb-0">
                            Try changing your filters or search query
                        </p>
                    </Alert>
                )}

                {/* View All Button */}
                {sortedNews.length < (newsList?.length || 0) && (
                    <div className='text-center mt-4'>
                        <Button
                            color="light"
                            onClick={() => this.setState({
                                filter: 'all',
                                searchQuery: '',
                                categoryFilter: 'all'
                            })}
                        >
                            <i className="fas fa-redo mr-2"></i>
                            Clear Filters
                        </Button>
                    </div>
                )}
            </Container>
        );
    }
}

const mapStateToProps = state => {
    return {
        newsList: state.news.newsList || [],
        isLoading: state.news.isLoading || false,
        error: state.news.error || null
    };
};

const mapDispatchToProps = {
    fetchNews
    // Add other actions here if needed
    // fetchFeaturedNews,
    // fetchNewsDetail,
    // etc.
};

export default connect(mapStateToProps, mapDispatchToProps)(NewsList);