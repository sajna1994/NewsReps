// app/containers/DailyChallengeLeaderboard/index.js
import React from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Card, CardBody, CardTitle,
    Table, Badge, Alert, Button
} from 'reactstrap';
import { Link } from 'react-router-dom';
import actions from '../../actions';

class DailyChallengeLeaderboard extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            challengeId: null,
            leaderboard: [],
            isLoading: true
        };
    }

    componentDidMount() {
        const { match } = this.props;
        if (match.params.id) {
            this.setState({ challengeId: match.params.id }, () => {
                this.fetchLeaderboard();
            });
        }
    }

    fetchLeaderboard = async () => {
        const { challengeId } = this.state;

        try {
            this.setState({ isLoading: true });

            const response = await fetch(`http://localhost:3000/api/daily-challenge/leaderboard/${challengeId}`);
            const data = await response.json();

            if (data.success) {
                this.setState({
                    leaderboard: data.leaderboard || [],
                    isLoading: false
                });
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            this.setState({ isLoading: false });
        }
    };

    renderMedal = (rank) => {
        if (rank === 1) return <Badge color="warning">🥇</Badge>;
        if (rank === 2) return <Badge color="secondary">🥈</Badge>;
        if (rank === 3) return <Badge color="danger">🥉</Badge>;
        return <Badge color="light">{rank}</Badge>;
    };

    render() {
        const { leaderboard, isLoading, challengeId } = this.state;

        if (isLoading) {
            return (
                <Container className='text-center py-5'>
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-3">Loading leaderboard...</p>
                </Container>
            );
        }

        return (
            <Container className='daily-challenge-leaderboard'>
                <Row className='justify-content-center'>
                    <Col md={10} lg={8}>
                        <Card className='mb-4'>
                            <CardBody className='text-center'>
                                <CardTitle tag="h2" className='mb-4'>
                                    <i className="fas fa-trophy mr-2 text-warning"></i>
                                    Daily Challenge Leaderboard
                                </CardTitle>

                                <Alert color="info" className='text-center'>
                                    <h5>🏆 Challenge Results</h5>
                                    <p className='mb-0'>
                                        Top performers are ranked by score, then by completion time.
                                    </p>
                                </Alert>

                                {leaderboard.length > 0 ? (
                                    <div className='leaderboard-table'>
                                        <Table striped hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>Rank</th>
                                                    <th>Player</th>
                                                    <th className='text-center'>Score</th>
                                                    <th className='text-center'>Time</th>
                                                    <th className='text-center'>Accuracy</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaderboard.map((participant, index) => (
                                                    <tr key={index} className={participant.rank <= 3 ? 'table-success' : ''}>
                                                        <td className='align-middle'>
                                                            {this.renderMedal(participant.rank)}
                                                        </td>
                                                        <td className='align-middle'>
                                                            <strong>
                                                                {participant.userId?.firstName || 'Anonymous'}
                                                                {participant.userId?.lastName ? ' ' + participant.userId.lastName : ''}
                                                            </strong>
                                                            <div className='small text-muted'>
                                                                {participant.userId?.email || ''}
                                                            </div>
                                                        </td>
                                                        <td className='align-middle text-center'>
                                                            <Badge color="primary" pill>
                                                                {participant.score}/{participant.totalQuestions}
                                                            </Badge>
                                                        </td>
                                                        <td className='align-middle text-center'>
                                                            <Badge color="info" pill>
                                                                {participant.timeTaken}s
                                                            </Badge>
                                                        </td>
                                                        <td className='align-middle text-center'>
                                                            <Badge color={
                                                                participant.percentage >= 80 ? 'success' :
                                                                    participant.percentage >= 60 ? 'warning' : 'danger'
                                                            } pill>
                                                                {participant.percentage}%
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>

                                        <div className='mt-4'>
                                            <p className='text-muted'>
                                                <small>
                                                    <i className="fas fa-info-circle mr-1"></i>
                                                    Showing {leaderboard.length} participants. Winner: Highest score → Fastest time.
                                                </small>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <Alert color="warning" className='text-center'>
                                        <h5>No Participants Yet</h5>
                                        <p>Be the first to participate in the next challenge!</p>
                                        <Link to='/' className='btn btn-primary'>
                                            <i className="fas fa-home mr-2"></i>
                                            Back to Home
                                        </Link>
                                    </Alert>
                                )}

                                <div className='mt-4'>
                                    <Link to='/' className='btn btn-secondary mr-2'>
                                        <i className="fas fa-arrow-left mr-2"></i>
                                        Back to Home
                                    </Link>
                                    <Button color="primary" onClick={this.fetchLeaderboard}>
                                        <i className="fas fa-sync-alt mr-2"></i>
                                        Refresh
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Challenge Rules */}
                        <Card className='mb-4'>
                            <CardBody>
                                <h5><i className="fas fa-info-circle mr-2"></i>How Winners Are Determined</h5>
                                <ul className='mb-0'>
                                    <li><strong>Primary:</strong> Highest score (correct answers)</li>
                                    <li><strong>Tiebreaker:</strong> Fastest completion time</li>
                                    <li><strong>Secondary tiebreaker:</strong> Earlier submission time</li>
                                </ul>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...actions
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DailyChallengeLeaderboard);