// app/containers/Homepage/index.js
import React from 'react';
import { connect } from 'react-redux';
import {
  Row, Col, Card, CardBody, CardTitle, CardText, Button,
  Alert, Badge, Progress
} from 'reactstrap';
import { Link } from 'react-router-dom';
import actions from '../../actions';

class Homepage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      timeLeft: 0,
      timer: null,
      challengeStatus: 'loading',
      countdown: null
    };
  }

  componentDidMount() {
    // Check if actions exist before calling
    if (this.props.fetchTodayFeaturedNews) {
      this.props.fetchTodayFeaturedNews();
    }

    if (this.props.fetchCurrentDailyChallenge) {
      this.props.fetchCurrentDailyChallenge();
    }

    // Start timer for updates
    this.startTimer();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentChallenge !== this.props.currentChallenge) {
      this.calculateTimeLeft();
    }
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  clearTimer = () => {
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }
  };

  startTimer = () => {
    this.clearTimer();

    const timer = setInterval(() => {
      this.calculateTimeLeft();
      // Only refresh if function exists
      if (this.props.fetchCurrentDailyChallenge) {
        this.props.fetchCurrentDailyChallenge();
      }
    }, 1000);

    this.setState({ timer });
  };

  calculateTimeLeft = () => {
    const { currentChallenge } = this.props;

    // Use mock data if no challenge from API
    const now = new Date();
    const startTime = new Date();
    startTime.setHours(20, 30, 0, 0);

    const endTime = new Date();
    endTime.setHours(20, 40, 0, 0);

    let timeLeft = 0;
    let status = 'scheduled';
    let countdown = null;

    if (now < startTime) {
      // Challenge hasn't started yet
      timeLeft = startTime - now;
      status = 'scheduled';
      countdown = {
        target: startTime,
        message: 'Challenge starts in'
      };
    } else if (now >= startTime && now <= endTime) {
      // Challenge is active
      timeLeft = endTime - now;
      status = 'active';
      countdown = {
        target: endTime,
        message: 'Challenge ends in'
      };
    } else {
      // Challenge has ended
      timeLeft = 0;
      status = 'completed';
    }

    this.setState({
      timeLeft,
      challengeStatus: status,
      countdown
    });
  };

  formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  renderChallengeTimer = () => {
    const { timeLeft, challengeStatus, countdown } = this.state;

    const percentage = challengeStatus === 'active'
      ? ((600000 - timeLeft) / 600000) * 100  // 10 minutes total
      : 0;

    return (
      <Card className='mb-4 challenge-timer-card bg-light'>
        <CardBody>
          <div className='d-flex justify-content-between align-items-center mb-3 '>
            <CardTitle tag="h4" className='mb-0'>
              <i className="fas fa-trophy mr-2 text-warning"></i>
              Daily Brain Challenge
            </CardTitle>
            <Badge color={
              challengeStatus === 'active' ? 'success' :
                challengeStatus === 'scheduled' ? 'warning' : 'secondary'
            }>
              {challengeStatus === 'active' ? 'LIVE' :
                challengeStatus === 'scheduled' ? 'UPCOMING' : 'COMPLETED'}
            </Badge>
          </div>

          <CardText>
            <strong>Time:</strong> 8:30 PM - 8:40 PM (10 minutes)<br />
            <strong>Questions:</strong> 10<br />
            <strong>Time per question:</strong> 10 seconds
          </CardText>

          {countdown && timeLeft > 0 && (
            <div className='countdown-section'>
              <h5 className='text-center'>
                <i className="fas fa-clock mr-2"></i>
                {countdown.message}: {this.formatTime(timeLeft)}
              </h5>
              {challengeStatus === 'active' && (
                <Progress
                  value={percentage}
                  color="success"
                  className="mb-3"
                />
              )}
            </div>
          )}

          {challengeStatus === 'active' && (
            <Alert color="success" className='text-center'>
              <h5>Challenge is LIVE! 🎯</h5>
              <p>Join now and compete with others!</p>
              <Button
                color="warning"
                size="lg"
                block
                onClick={() => this.props.history.push('/daily-challenge')}
              >
                <i className="fas fa-bolt mr-2"></i>
                Join Challenge Now!
              </Button>
            </Alert>
          )}

          {challengeStatus === 'scheduled' && (
            <Alert color="warning" className='text-center'>
              <h5>Challenge starts at 8:30 PM ⏰</h5>
              <p>Get ready to test your knowledge!</p>
            </Alert>
          )}

          {challengeStatus === 'completed' && (
            <Alert color="info" className='text-center'>
              <h5>Challenge Completed ✅</h5>
              <p>Check the leaderboard to see winners!</p>
              <Button
                color="info"
                onClick={() => this.props.history.push('/daily-challenge')}
              >
                <i className="fas fa-chart-line mr-2"></i>
                View Leaderboard
              </Button>
            </Alert>
          )}

          <div className='rules mt-3'>
            <h6><i className="fas fa-info-circle mr-2"></i>Rules:</h6>
            <ul className='small text-muted'>
              <li>Each question: 10 seconds</li>
              <li>Winner: Highest score → Fastest time</li>
              <li>Only attempts during 8:30-8:40 PM count</li>
              <li>Real-time leaderboard updates</li>
            </ul>
          </div>
        </CardBody>
      </Card>
    );
  };

  render() {
    const { todayFeaturedNews, isLoading } = this.props;

    if (isLoading) {
      return (
        <div className='homepage text-center py-5'>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-3">Loading...</p>
        </div>
      );
    }

    return (
      <div className='homepage'>
        {/* Floating Brain Image */}
        <div className='floating-brain d-none d-lg-block'>
          <img
            src="/images/pngegg (5).png"
            alt="Brain Gym"
            className='img-fluid'
            style={{
              width: '700px', // Twice the size (500px)
              height: 'auto',
              position: 'fixed',
              right: '1px', // Position on right side
              top: '55%', // Center vertically
              transform: 'translateY(-50%)', // Perfect vertical centering
              zIndex: 1000,
              borderRadius: '15px',
              opacity: 0.9
            }}
          />
        </div>
        {/* Hero Section */}
        <div className='hero-section text-center py-5 mb-5'>
          <h1 className='display-4'>Brain Gym</h1>
          <p className='lead'>Read News. Test Your Understanding. Exercise Your Mind.</p>
        </div>

        {/* Daily Challenge Timer Section */}
        <div className='mb-5'>
          {this.renderChallengeTimer()}
        </div>

        {/* Today's Featured News Section */}
        <div className='featured-news mb-5'>
          <h2 className='section-title mb-4'>Today's Featured News</h2>
          {todayFeaturedNews && todayFeaturedNews.length > 0 ? (
            <Row>
              {todayFeaturedNews.map((news, index) => (
                <Col key={news._id} md={index === 0 ? 12 : 6} lg={index === 0 ? 8 : 4} className='mb-4'>
                  <Card className='h-100 news-card'>
                    {news.imageUrl && (
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        className='card-img-top'
                        style={{ height: index === 0 ? '300px' : '200px', objectFit: 'cover' }}
                      />
                    )}
                    <CardBody>
                      <CardTitle tag='h5'>{news.title}</CardTitle>
                      <CardText>
                        {news.summary || (news.content && news.content.substring(0, 150)) || 'No content available'}...
                      </CardText>
                      <div className='d-flex justify-content-between align-items-center'>
                        <span className='badge badge-primary'>{news.category || 'General'}</span>
                        <span className='badge badge-secondary'>{news.difficulty || 'Medium'}</span>
                      </div>
                      <div className='mt-3'>
                        <Link to={`/news/${news._id}`} className='btn btn-primary mr-2'>
                          Read More
                        </Link>
                        {news.questions && news.questions.length > 0 && (
                          <Link to={`/quiz/${news._id}`} className='btn btn-success'>
                            Practice Quiz ({news.questions.length} questions)
                          </Link>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className='text-center py-5'>
              <h4>No featured news for today. Check back soon!</h4>
              <p className="text-muted">Or browse all news <Link to="/news">here</Link>.</p>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className='how-it-works mb-5'>
          <h2 className='section-title mb-4'>How Daily Challenge Works</h2>
          <Row>
            <Col md={3} className='text-center mb-4'>
              <div className='step-icon mb-3'>
                <i className='fas fa-calendar-check fa-3x text-primary'></i>
              </div>
              <h5>1. Daily at 8:30 PM</h5>
              <p className='small'>Challenge opens for 10 minutes only</p>
            </Col>
            <Col md={3} className='text-center mb-4'>
              <div className='step-icon mb-3'>
                <i className='fas fa-stopwatch fa-3x text-danger'></i>
              </div>
              <h5>2. 10 Seconds Per Question</h5>
              <p className='small'>Quick thinking required</p>
            </Col>
            <Col md={3} className='text-center mb-4'>
              <div className='step-icon mb-3'>
                {/* <i className='fas fa-trophy fa-3x text-warning'></i> */}
              </div>
              <h5>3. Compete & Win</h5>
              <p className='small'>Highest score wins, time breaks ties</p>
            </Col>
            <Col md={3} className='text-center mb-4'>
              <div className='step-icon mb-3'>
                <i className='fas fa-medal fa-3x text-success'></i>
              </div>
              <h5>4. Earn Recognition</h5>
              <p className='small'>Top performers on leaderboard</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    todayFeaturedNews: state.news ? state.news.todayFeaturedNews || [] : [],
    currentChallenge: state.homepage ? state.homepage.currentChallenge : null,
    isLoading: state.news ? state.news.isLoading ||
      (state.homepage ? state.homepage.isLoading : false) : false
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...actions // This includes all actions from actions.js
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Homepage);