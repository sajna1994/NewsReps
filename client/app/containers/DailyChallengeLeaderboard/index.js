// app/containers/DailyChallengeLeaderboard/index.js
import React from 'react';
import { Container, Alert, Button } from 'reactstrap';
import { Link } from 'react-router-dom';

class DailyChallengeLeaderboard extends React.PureComponent {
    render() {
        return (
            <Container className='text-center py-5'>
                <Alert color="info">
                    <h2>Leaderboard Coming Soon</h2>
                    <p className="lead">This feature is under development.</p>
                    <p>Check back later to see the top performers!</p>
                    <Link to='/' className='btn btn-primary mt-3'>
                        Back to Home
                    </Link>
                </Alert>
            </Container>
        );
    }
}

export default DailyChallengeLeaderboard;