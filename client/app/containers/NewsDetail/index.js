// app/containers/NewsDetail/index.js
import React from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Badge, Button } from 'reactstrap';
import { Link } from 'react-router-dom';

class NewsDetail extends React.PureComponent {
    state = {
        news: null,
        isLoading: true,
        error: null
    };

    componentDidMount() {
        this.fetchNewsDetail();
    }

    fetchNewsDetail = async () => {
        const { match } = this.props;
        try {
            const response = await fetch(`http://localhost:3000/api/news/${match.params.id}`);
            const data = await response.json();

            if (data.success) {
                this.setState({ news: data.news, isLoading: false });
            } else {
                this.setState({ error: data.error, isLoading: false });
            }
        } catch (error) {
            this.setState({ error: 'Failed to load news article', isLoading: false });
        }
    };

    render() {
        const { news, isLoading, error } = this.state;

        if (isLoading) {
            return (
                <Container className='news-detail'>
                    <div className='text-center py-5'>
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-3">Loading news article...</p>
                    </div>
                </Container>
            );
        }

        if (error) {
            return (
                <Container className='news-detail'>
                    <div className='text-center py-5'>
                        <h4>Error loading news article</h4>
                        <p className="text-danger">{error}</p>
                        <Link to='/news' className='btn btn-primary mt-3'>
                            Back to News
                        </Link>
                    </div>
                </Container>
            );
        }

        if (!news) {
            return (
                <Container className='news-detail'>
                    <div className='text-center py-5'>
                        <h4>News article not found.</h4>
                        <Link to='/news' className='btn btn-primary mt-3'>
                            Back to News
                        </Link>
                    </div>
                </Container>
            );
        }

        return (
            <Container className='news-detail'>
                <Row className='justify-content-center'>
                    <Col md={10} lg={8}>
                        <Card>
                            {news.imageUrl && (
                                <img
                                    src={news.imageUrl}
                                    alt={news.title}
                                    className='card-img-top'
                                    style={{ maxHeight: '500px', objectFit: 'cover' }}
                                />
                            )}
                            <CardBody>
                                <div className='d-flex justify-content-between align-items-center mb-3'>
                                    <div>
                                        <Badge color="primary" className='mr-2'>{news.category}</Badge>
                                        <Badge color="secondary">{news.difficulty}</Badge>
                                    </div>
                                    <div className='text-muted'>
                                        <small>
                                            Published: {new Date(news.publishedDate).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>

                                <CardTitle tag="h1" className='mb-4'>{news.title}</CardTitle>

                                <CardText className='mt-4' style={{ whiteSpace: 'pre-wrap' }}>
                                    {news.content}
                                </CardText>

                                <div className='mt-4'>
                                    <Link to='/news' className='btn btn-secondary mr-2'>
                                        Back to News
                                    </Link>
                                    <Link to='/' className='btn btn-outline-primary'>
                                        Home
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default NewsDetail;