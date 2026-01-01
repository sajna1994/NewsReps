// app/containers/TodaysNews/index.js
import React from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Card, CardBody, CardTitle, CardText,
    Button, Badge, Alert, Input, FormGroup, Label
} from 'reactstrap';
import { Link } from 'react-router-dom';
import actions from '../../actions';
import { fetchTodaysNews } from '../News/actions';

class TodaysNews extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            filterCategory: 'all',
            searchQuery: ''
        };
    }

    componentDidMount() {
        console.log('TodaysNews component mounted');
        console.log('Props:', this.props);
        this.fetchTodaysNews();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.todaysNews !== this.props.todaysNews) {
            console.log('todaysNews updated:', this.props.todaysNews);
        }
    }
    fetchTodaysNews = () => {
        console.log('Calling fetchTodaysNews action');
        this.props.fetchTodaysNews();
    };

    handleCategoryFilter = (category) => {
        this.setState({ filterCategory: category });
    };

    handleSearchChange = (e) => {
        this.setState({ searchQuery: e.target.value });
    };

    filterNews = (news) => {
        const { filterCategory, searchQuery } = this.state;

        let filtered = news;

        // Filter by category
        if (filterCategory !== 'all') {
            filtered = filtered.filter(item => item.category === filterCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.content.toLowerCase().includes(query) ||
                item.summary.toLowerCase().includes(query)
            );
        }

        return filtered;
    };

    getUniqueCategories = (news) => {
        const categories = news.map(item => item.category);
        return ['all', ...new Set(categories)];
    };

    renderNewsCard = (news) => {
        return (
            <Col key={news._id} md={6} lg={4} className='mb-4'>
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
                            <Badge color="primary" pill>{news.category}</Badge>
                            <Badge color={news.difficulty === 'Hard' ? 'danger' : news.difficulty === 'Medium' ? 'warning' : 'success'} pill>
                                {news.difficulty}
                            </Badge>
                        </div>

                        <CardTitle tag="h5" className='mb-2'>
                            <Link to={`/news/${news._id}`} className='text-dark'>
                                {news.title}
                            </Link>
                        </CardTitle>

                        <CardText className='text-muted small mb-3'>
                            {news.summary || news.content.substring(0, 100)}...
                        </CardText>

                        <div className='d-flex justify-content-between align-items-center'>
                            <div>
                                <small className='text-muted'>
                                    <i className="far fa-clock mr-1"></i>
                                    {new Date(news.publishedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </small>
                            </div>
                            <div>
                                <Badge color="info" pill className='mr-2'>
                                    <i className="far fa-eye mr-1"></i>
                                    {news.views || 0}
                                </Badge>
                                <Badge color={news.questions && news.questions.length > 0 ? 'success' : 'secondary'} pill>
                                    <i className="far fa-question-circle mr-1"></i>
                                    {news.questions ? news.questions.length : 0}
                                </Badge>
                            </div>
                        </div>

                        <div className='mt-3'>
                            <Link to={`/news/${news._id}`} className='btn btn-sm btn-outline-primary mr-2'>
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

    render() {
        const { todaysNews, isLoading, error } = this.props;
        const { filterCategory, searchQuery } = this.state;

        if (isLoading) {
            return (
                <Container className='text-center py-5'>
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-3">Loading today's news...</p>
                </Container>
            );
        }

        if (error) {
            return (
                <Container className='py-5'>
                    <Alert color="danger">
                        <h4>Error loading news</h4>
                        <p>{error}</p>
                        <Button color="primary" onClick={this.fetchTodaysNews}>
                            Try Again
                        </Button>
                    </Alert>
                </Container>
            );
        }

        const filteredNews = this.filterNews(todaysNews || []);
        const categories = this.getUniqueCategories(todaysNews || []);

        return (
            <Container className='todays-news-page'>
                {/* Header */}
                <Row className='mb-4'>
                    <Col>
                        <div className='d-flex justify-content-between align-items-center'>
                            <div>
                                <h1 className='display-5'>Today's News</h1>
                                <p className='lead text-muted'>
                                    Stay updated with all news articles from today
                                    <span className='badge badge-light ml-2'>
                                        {filteredNews.length} articles
                                    </span>
                                </p>
                            </div>
                            <Link to='/news' className='btn btn-outline-secondary'>
                                <i className="fas fa-newspaper mr-2"></i>
                                All News
                            </Link>
                        </div>
                    </Col>
                </Row>

                {/* Filters */}
                <Card className='mb-4'>
                    <CardBody>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="search">Search News</Label>
                                    <Input
                                        type="text"
                                        id="search"
                                        placeholder="Search by title or content..."
                                        value={searchQuery}
                                        onChange={this.handleSearchChange}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Filter by Category</Label>
                                    <div className="category-filters">
                                        {categories.map(cat => (
                                            <Button
                                                key={cat}
                                                color={filterCategory === cat ? 'primary' : 'light'}
                                                size="sm"
                                                className='mr-2 mb-2'
                                                onClick={() => this.handleCategoryFilter(cat)}
                                            >
                                                {cat === 'all' ? 'All Categories' : cat}
                                                {filterCategory === cat && (
                                                    <Badge color="light" className='ml-2'>
                                                        {cat === 'all' ? todaysNews.length :
                                                            todaysNews.filter(n => n.category === cat).length}
                                                    </Badge>
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                </FormGroup>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* News Grid */}
                {filteredNews.length > 0 ? (
                    <Row>
                        {filteredNews.map(news => this.renderNewsCard(news))}
                    </Row>
                ) : (
                    <Alert color="info" className='text-center py-5'>
                        <h4>No news articles found</h4>
                        <p className="mb-0">
                            {searchQuery ? 'Try a different search term' : 'Check back later for today\'s news'}
                        </p>
                    </Alert>
                )}

                {/* Stats Footer */}
                <Card className='mt-4'>
                    <CardBody>
                        <Row>
                            <Col md={3} className='text-center'>
                                <h3>{todaysNews.length}</h3>
                                <p className='text-muted mb-0'>Total Articles</p>
                            </Col>
                            <Col md={3} className='text-center'>
                                <h3 className='text-success'>
                                    {todaysNews.filter(n => n.questions && n.questions.length > 0).length}
                                </h3>
                                <p className='text-muted mb-0'>With Quizzes</p>
                            </Col>
                            <Col md={3} className='text-center'>
                                <h3 className='text-warning'>
                                    {[...new Set(todaysNews.map(n => n.category))].length}
                                </h3>
                                <p className='text-muted mb-0'>Categories</p>
                            </Col>
                            <Col md={3} className='text-center'>
                                <h3 className='text-info'>
                                    {todaysNews.reduce((sum, news) => sum + (news.views || 0), 0)}
                                </h3>
                                <p className='text-muted mb-0'>Total Views</p>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Container>
        );
    }
}

const mapStateToProps = state => {
    return {
        todaysNews: state.news.todaysNews || [],
        isLoading: state.news.isLoading || false,
        error: state.news.error || null
    };
};

const mapDispatchToProps = {
    fetchTodaysNews
    // Add other actions here if needed
};

export default connect(mapStateToProps, mapDispatchToProps)(TodaysNews);