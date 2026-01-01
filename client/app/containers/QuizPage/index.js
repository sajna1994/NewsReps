import React from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Card, CardBody, CardTitle,
    CardText, Button, Progress, Alert, Badge
} from 'reactstrap';
import { Link } from 'react-router-dom';

import actions from '../../actions';
import LoadingIndicator from '../../components/Common/LoadingIndicator';

class QuizPage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            currentQuestion: 0,
            userAnswers: [],
            timeLeft: 10,
            timer: null,
            quizStarted: false,
            quizCompleted: false,
            quizResult: null,
            showExplanation: false
        };
    }

    componentDidMount() {
        const { match } = this.props;
        if (match.params.newsId) {
            // For single news quiz
            this.props.fetchNewsDetail(match.params.newsId);
        } else {
            // For daily quiz
            this.props.fetchDailyQuiz();
        }
    }

    componentDidUpdate(prevProps) {
        const { dailyQuiz, currentNews } = this.props;

        if (!prevProps.dailyQuiz && dailyQuiz) {
            this.startQuiz();
        }

        if (!prevProps.currentNews && currentNews && currentNews.questions) {
            this.setState({ quizStarted: true });
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

    startQuiz = () => {
        this.setState({ quizStarted: true }, () => {
            this.startTimer();
        });
    };

    startTimer = () => {
        this.clearTimer();

        const timer = setInterval(() => {
            this.setState(prevState => {
                if (prevState.timeLeft <= 1) {
                    this.handleNextQuestion();
                    return { timeLeft: 10 };
                }
                return { timeLeft: prevState.timeLeft - 1 };
            });
        }, 1000);

        this.setState({ timer, timeLeft: 10 });
    };

    getCurrentQuestion = () => {
        const { dailyQuiz, currentNews, match } = this.props;
        const { currentQuestion } = this.state;

        if (match.params.newsId && currentNews && currentNews.questions) {
            // Single news quiz
            return {
                ...currentNews.questions[currentQuestion],
                newsTitle: currentNews.title,
                newsCategory: currentNews.category
            };
        } else if (dailyQuiz && dailyQuiz.questions) {
            // Daily quiz
            const question = dailyQuiz.questions[currentQuestion];
            return {
                ...question,
                newsTitle: question.newsId?.title || 'News Article',
                newsCategory: question.newsId?.category || 'General'
            };
        }

        return null;
    };

    handleAnswerSelect = (answerIndex) => {
        const { currentQuestion, userAnswers } = this.state;
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestion] = answerIndex;

        this.setState({
            userAnswers: newAnswers,
            showExplanation: true
        });

        // Auto-advance after 3 seconds to show explanation
        setTimeout(() => {
            this.handleNextQuestion();
        }, 3000);
    };

    handleNextQuestion = () => {
        const { dailyQuiz, currentNews, match } = this.props;
        const { currentQuestion, userAnswers } = this.state;

        let totalQuestions;
        if (match.params.newsId && currentNews) {
            totalQuestions = currentNews.questions ? currentNews.questions.length : 0;
        } else if (dailyQuiz) {
            totalQuestions = dailyQuiz.questions ? dailyQuiz.questions.length : 0;
        }

        if (currentQuestion < totalQuestions - 1) {
            this.setState(prevState => ({
                currentQuestion: prevState.currentQuestion + 1,
                timeLeft: 10,
                showExplanation: false
            }), () => {
                this.startTimer();
            });
        } else {
            this.completeQuiz();
        }
    };

    completeQuiz = () => {
        this.clearTimer();

        const { userAnswers } = this.state;
        const { dailyQuiz, currentNews, match } = this.props;

        let questions, quizId;

        if (match.params.newsId && currentNews) {
            questions = currentNews.questions;
            quizId = currentNews._id;
        } else if (dailyQuiz) {
            questions = dailyQuiz.questions;
            quizId = dailyQuiz._id;
        }

        // Calculate score
        let score = 0;
        const results = questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            if (isCorrect) {
                score++;
            }

            return {
                question: question.question,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation
            };
        });

        const percentage = (score / questions.length) * 100;

        this.setState({
            quizCompleted: true,
            quizResult: {
                score,
                totalQuestions: questions.length,
                percentage: percentage.toFixed(2),
                results
            }
        });

        // Submit quiz results to backend
        if (quizId) {
            this.props.submitQuizResults(quizId, userAnswers);
        }
    };

    renderQuizIntro = () => {
        const { dailyQuiz, currentNews, match } = this.props;

        if (match.params.newsId && currentNews) {
            return (
                <Card className='mb-4'>
                    <CardBody className='text-center'>
                        <CardTitle tag="h3">{currentNews.title}</CardTitle>
                        <CardText>
                            <Badge color="primary" className='mr-2'>{currentNews.category}</Badge>
                            <Badge color="info">{currentNews.questions?.length || 0} Questions</Badge>
                        </CardText>
                        <p className="lead">
                            Answer {currentNews.questions?.length || 0} questions about this news article.
                            You have 10 seconds per question!
                        </p>
                        <Button color="success" size="lg" onClick={this.startQuiz}>
                            Start Quiz
                        </Button>
                    </CardBody>
                </Card>
            );
        } else if (dailyQuiz) {
            return (
                <Card className='mb-4'>
                    <CardBody className='text-center'>
                        <CardTitle tag="h3">{dailyQuiz.title}</CardTitle>
                        <CardText>
                            <Badge color="primary" className='mr-2'>Daily Challenge</Badge>
                            <Badge color="info">{dailyQuiz.totalQuestions} Questions</Badge>
                            <Badge color="warning">{dailyQuiz.totalTime} Seconds Total</Badge>
                        </CardText>
                        <p className="lead">
                            Test your knowledge with {dailyQuiz.totalQuestions} questions from recent news.
                            You have {dailyQuiz.timePerQuestion} seconds per question!
                        </p>
                        <Button color="success" size="lg" onClick={this.startQuiz}>
                            Start Daily Challenge
                        </Button>
                    </CardBody>
                </Card>
            );
        }

        return null;
    };

    renderQuestion = () => {
        const { currentQuestion, timeLeft, userAnswers, showExplanation } = this.state;
        const question = this.getCurrentQuestion();

        if (!question) return null;

        const userAnswer = userAnswers[currentQuestion];
        const isCorrect = userAnswer === question.correctAnswer;

        return (
            <Card className='mb-4'>
                <CardBody>
                    {/* Progress and Timer */}
                    <div className='d-flex justify-content-between align-items-center mb-4'>
                        <div>
                            <Badge color="info">Question {currentQuestion + 1}</Badge>
                            <Badge color="primary" className='ml-2'>{question.newsCategory}</Badge>
                        </div>
                        <div className='text-right'>
                            <div className='timer-display mb-2'>
                                <Badge color={timeLeft <= 5 ? 'danger' : 'warning'} pill>
                                    <i className="fas fa-clock mr-2"></i>
                                    {timeLeft}s
                                </Badge>
                            </div>
                            <Progress
                                value={(timeLeft / 10) * 100}
                                color={timeLeft <= 5 ? 'danger' : 'warning'}
                                style={{ width: '100px' }}
                            />
                        </div>
                    </div>

                    {/* Question */}
                    <CardTitle tag="h4" className='mb-4'>{question.question}</CardTitle>
                    <CardText className='text-muted mb-4'>
                        From: <strong>{question.newsTitle}</strong>
                    </CardText>

                    {/* Options */}
                    <div className='quiz-options'>
                        {question.options.map((option, index) => {
                            let color = 'secondary';
                            let outline = true;

                            if (showExplanation) {
                                if (index === question.correctAnswer) {
                                    color = 'success';
                                    outline = false;
                                } else if (index === userAnswer && index !== question.correctAnswer) {
                                    color = 'danger';
                                    outline = false;
                                }
                            } else if (index === userAnswer) {
                                color = 'primary';
                                outline = false;
                            }

                            return (
                                <Button
                                    key={index}
                                    color={color}
                                    outline={outline}
                                    block
                                    className='mb-3 text-left'
                                    onClick={() => !showExplanation && this.handleAnswerSelect(index)}
                                    disabled={showExplanation}
                                >
                                    <div className='d-flex align-items-center'>
                                        <div className='option-letter mr-3'>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <div className='option-text'>{option}</div>
                                    </div>
                                </Button>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    {showExplanation && question.explanation && (
                        <Alert color={isCorrect ? 'success' : 'danger'} className='mt-4'>
                            <strong>Explanation:</strong> {question.explanation}
                        </Alert>
                    )}

                    {/* Navigation */}
                    <div className='mt-4 text-center'>
                        {!showExplanation ? (
                            <Button color="secondary" onClick={this.handleNextQuestion}>
                                Skip Question
                            </Button>
                        ) : (
                            <Button color="primary" onClick={this.handleNextQuestion}>
                                Next Question →
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>
        );
    };

    renderResults = () => {
        const { quizResult } = this.state;
        const { dailyQuiz, currentNews, match } = this.props;

        if (!quizResult) return null;

        const quizTitle = match.params.newsId
            ? currentNews?.title
            : dailyQuiz?.title || 'Quiz';

        return (
            <Card className='mb-4'>
                <CardBody className='text-center'>
                    <CardTitle tag="h3" className='mb-4'>Quiz Complete!</CardTitle>

                    {/* Score Display */}
                    <div className='score-display mb-4'>
                        <div className='score-circle mx-auto'>
                            <h1 className='display-1'>{quizResult.percentage}%</h1>
                            <p className='lead'>
                                {quizResult.score} / {quizResult.totalQuestions} Correct
                            </p>
                        </div>
                    </div>

                    {/* Performance Message */}
                    <Alert color={
                        quizResult.percentage >= 80 ? 'success' :
                            quizResult.percentage >= 60 ? 'warning' : 'danger'
                    }>
                        <h5>
                            {quizResult.percentage >= 80 ? '🎉 Excellent!' :
                                quizResult.percentage >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
                        </h5>
                        <p className='mb-0'>
                            {quizResult.percentage >= 80 ? 'You have excellent knowledge!' :
                                quizResult.percentage >= 60 ? 'You have good understanding!' :
                                    'Practice more to improve your score!'}
                        </p>
                    </Alert>

                    {/* Detailed Results */}
                    <div className='detailed-results mt-4'>
                        <h5>Detailed Results:</h5>
                        {quizResult.results.map((result, index) => (
                            <div key={index} className={`result-item p-3 mb-2 ${result.isCorrect ? 'bg-success-light' : 'bg-danger-light'}`}>
                                <div className='d-flex justify-content-between'>
                                    <strong>Q{index + 1}: {result.question}</strong>
                                    <Badge color={result.isCorrect ? 'success' : 'danger'}>
                                        {result.isCorrect ? '✓ Correct' : '✗ Wrong'}
                                    </Badge>
                                </div>
                                <div className='mt-2'>
                                    <small className='text-muted'>
                                        Your answer: {String.fromCharCode(65 + result.userAnswer)} |
                                        Correct answer: {String.fromCharCode(65 + result.correctAnswer)}
                                    </small>
                                    {result.explanation && (
                                        <div className='mt-1'>
                                            <small><strong>Explanation:</strong> {result.explanation}</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className='mt-4'>
                        <Link to='/news' className='btn btn-secondary mr-2'>
                            <i className="fas fa-newspaper mr-2"></i>
                            Browse More News
                        </Link>
                        <Link to='/' className='btn btn-primary mr-2'>
                            <i className="fas fa-home mr-2"></i>
                            Back to Home
                        </Link>
                        {!match.params.newsId && (
                            <Button color="success" onClick={() => window.location.reload()}>
                                <i className="fas fa-redo mr-2"></i>
                                Try Again
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>
        );
    };

    render() {
        const { isLoading, error } = this.props;
        const { quizStarted, quizCompleted } = this.state;

        if (isLoading) {
            return (
                <Container className='quiz-page'>
                    <div className='text-center py-5'>
                        <LoadingIndicator />
                        <p className="mt-3">Loading quiz...</p>
                    </div>
                </Container>
            );
        }

        if (error) {
            return (
                <Container className='quiz-page'>
                    <div className='text-center py-5'>
                        <Alert color="danger">
                            <h4>Error loading quiz</h4>
                            <p>{error}</p>
                        </Alert>
                        <Link to='/news' className='btn btn-primary mt-3'>
                            Back to News
                        </Link>
                    </div>
                </Container>
            );
        }

        return (
            <Container className='quiz-page'>
                <Row className='justify-content-center'>
                    <Col md={10} lg={8}>
                        {!quizStarted && !quizCompleted && this.renderQuizIntro()}
                        {quizStarted && !quizCompleted && this.renderQuestion()}
                        {quizCompleted && this.renderResults()}
                    </Col>
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = state => {
    return {
        dailyQuiz: state.quiz ? state.quiz.dailyQuiz : null,
        currentNews: state.news ? state.news.currentNews : null,
        isLoading: state.quiz ? state.quiz.isLoading || state.news?.isLoading || false : false,
        error: state.quiz ? state.quiz.error || state.news?.error || null : null
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchDailyQuiz: () => dispatch(actions.fetchDailyQuiz()),
        fetchNewsDetail: (id) => dispatch(actions.fetchNewsDetail(id)),
        submitQuizResults: (quizId, answers) => dispatch(actions.submitQuizResults(quizId, answers))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuizPage);