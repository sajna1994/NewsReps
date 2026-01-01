import React from 'react';
import { connect } from 'react-redux';
import {
    Row, Col, Table, Button, Modal, ModalHeader,
    ModalBody, ModalFooter, Badge, FormGroup,
    Label, Input as ReactstrapInput, Alert,
    Card, CardBody
} from 'reactstrap';
import { Link } from 'react-router-dom';

import actions from '../../actions';
import Input from '../../components/Common/Input';
import LoadingIndicator from '../../components/Common/LoadingIndicator';
import TextArea from '../../components/Common/Area/TextArea';

class NewsAdmin extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isModalOpen: false,
            isQuestionModalOpen: false,
            isViewQuestionsModalOpen: false,
            questionForm: {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                explanation: ''
            },
            selectedNewsForQuestions: null,
            selectedNewsQuestions: []
        };
    }

    componentDidMount() {
        this.props.fetchNews();
    }

    // Form handlers
    handleChange = (name, value) => {
        this.props.setNewsFormData(name, value);
    };

    handleQuestionChange = (index, value) => {
        const { questionForm } = this.state;
        const newOptions = [...questionForm.options];
        newOptions[index] = value;

        this.setState({
            questionForm: {
                ...questionForm,
                options: newOptions
            }
        });
    };

    handleQuestionInputChange = (name, value) => {
        this.setState(prevState => ({
            questionForm: {
                ...prevState.questionForm,
                [name]: value
            }
        }));
    };

    handleSubmit = (e) => {
        e.preventDefault();
        const { formData, isEditMode, editId } = this.props;

        // Prepare tags as array
        const formattedData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        if (isEditMode) {
            this.props.updateNews(editId, formattedData);
        } else {
            this.props.createNews(formattedData);
        }

        this.toggleModal();
    };

    handleQuestionSubmit = (e) => {
        e.preventDefault();
        const { questionForm } = this.state;
        const { editId } = this.props;

        // Validate form
        if (!questionForm.question.trim()) {
            alert('Please enter a question');
            return;
        }
        if (questionForm.options.some(opt => !opt.trim())) {
            alert('Please fill all options');
            return;
        }

        console.log('Submitting question for news:', editId, 'with data:', questionForm);

        if (editId) {
            // Make sure this action exists and is connected
            this.props.addQuestionToNews(editId, questionForm);

            // Reset form and close modal
            this.setState({
                questionForm: {
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    explanation: ''
                }
            });
            this.toggleQuestionModal();
        } else {
            alert('No news article selected');
        }
    };

    handleEdit = (news) => {
        this.props.setNewsFormData('title', news.title);
        this.props.setNewsFormData('content', news.content);
        this.props.setNewsFormData('summary', news.summary);
        this.props.setNewsFormData('category', news.category);
        this.props.setNewsFormData('imageUrl', news.imageUrl);
        this.props.setNewsFormData('source', news.source);
        this.props.setNewsFormData('difficulty', news.difficulty);
        this.props.setNewsFormData('tags', news.tags.join(', '));
        this.props.setNewsFormData('isPublished', news.isPublished);
        this.props.setNewsFormData('isFeatured', news.isFeatured);

        // Set edit mode
        this.props.dispatch({ type: 'SET_NEWS_EDIT_MODE', payload: true });
        this.props.dispatch({ type: 'SET_NEWS_EDIT_ID', payload: news._id });

        this.toggleModal();
    };

    handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this news article?')) {
            this.props.deleteNews(id);
        }
    };

    handleAddQuestion = (news) => {
        console.log('Adding question for news:', news);

        // Store news ID in component state instead of Redux
        this.setState({
            questionForm: {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                explanation: ''
            },
            currentNewsId: news._id // Store in component state
        });

        this.toggleQuestionModal();
    };

    handleQuestionSubmit = (e) => {
        e.preventDefault();
        const { questionForm } = this.state;
        const { currentNewsId } = this.state; // Get from component state

        console.log('Submitting question for news ID:', currentNewsId);

        if (!currentNewsId) {
            alert('Error: No news article selected');
            return;
        }

        // Validate
        if (!questionForm.question.trim()) {
            alert('Please enter a question');
            return;
        }

        const emptyOptions = questionForm.options.filter(opt => !opt.trim());
        if (emptyOptions.length > 0) {
            alert('Please fill all options');
            return;
        }

        // Call the action
        this.props.addQuestionToNews(currentNewsId, questionForm);

        // Reset form and close modal
        this.setState({
            questionForm: {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                explanation: ''
            },
            currentNewsId: null
        });
        this.toggleQuestionModal();
    };

    handleViewQuestions = async (news) => {
        try {
            // Fetch news detail to get questions
            const response = await fetch(`http://localhost:3000/api/news/${news._id}`);
            const data = await response.json();

            if (data.success) {
                this.setState({
                    selectedNewsForQuestions: news,
                    selectedNewsQuestions: data.news.questions || []
                });
                this.toggleViewQuestionsModal();
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    handleDeleteQuestion = async (newsId, questionIndex) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                // You'll need to implement this in your backend
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/api/news/${newsId}/questions/${questionIndex}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    // Refresh questions
                    this.handleViewQuestions(this.state.selectedNewsForQuestions);
                }
            } catch (error) {
                console.error('Error deleting question:', error);
            }
        }
    };

    // Modal handlers
    toggleModal = () => {
        this.setState(prevState => ({
            isModalOpen: !prevState.isModalOpen
        }), () => {
            if (!this.state.isModalOpen) {
                this.props.resetNewsForm();
            }
        });
    };

    toggleQuestionModal = () => {
        this.setState(prevState => ({
            isQuestionModalOpen: !prevState.isQuestionModalOpen,
            questionForm: {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                explanation: ''
            }
        }));
    };

    toggleViewQuestionsModal = () => {
        this.setState(prevState => ({
            isViewQuestionsModalOpen: !prevState.isViewQuestionsModalOpen
        }));
    };

    renderStatusBadge = (isPublished, isFeatured) => {
        if (isFeatured) return <Badge color="success">Featured</Badge>;
        if (isPublished) return <Badge color="primary">Published</Badge>;
        return <Badge color="secondary">Draft</Badge>;
    };

    render() {
        const {
            newsList,
            formData,
            isLoading,
            isSubmitting
        } = this.props;

        const {
            isModalOpen,
            isQuestionModalOpen,
            isViewQuestionsModalOpen,
            questionForm,
            selectedNewsForQuestions,
            selectedNewsQuestions
        } = this.state;

        const categories = ['General', 'Politics', 'Technology', 'Science', 'Health', 'Business', 'Sports', 'Entertainment', 'Education'];
        const difficulties = ['Easy', 'Medium', 'Hard'];

        return (
            <div className='news-admin'>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <h2>Manage News Articles</h2>
                    <div>
                        <Button color='primary' onClick={this.toggleModal} className='mr-2'>
                            <i className='fas fa-plus mr-2'></i> Add News
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <LoadingIndicator />
                ) : (
                    <Table striped responsive hover>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Questions</th>
                                <th>Published</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {newsList.map(item => (
                                <tr key={item._id}>
                                    <td>{item.title}</td>
                                    <td>
                                        <Badge color="info">{item.category}</Badge>
                                    </td>
                                    <td>
                                        {this.renderStatusBadge(item.isPublished, item.isFeatured)}
                                    </td>
                                    <td>
                                        <Badge color={item.questions && item.questions.length > 0 ? "success" : "warning"}>
                                            {item.questions ? item.questions.length : 0}
                                        </Badge>
                                    </td>
                                    <td>
                                        {new Date(item.publishedDate).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="btn-group" role="group">
                                            <Button
                                                color='info'
                                                size='sm'
                                                className='mr-1'
                                                onClick={() => this.handleEdit(item)}
                                                title="Edit News"
                                            >
                                                <i className='fas fa-edit'></i>
                                            </Button>
                                            <Button
                                                color='danger'
                                                size='sm'
                                                className='mr-1'
                                                onClick={() => this.handleDelete(item._id)}
                                                title="Delete News"
                                            >
                                                <i className='fas fa-trash'></i>
                                            </Button>
                                            <Button
                                                color='success'
                                                size='sm'
                                                className='mr-1'
                                                onClick={() => this.handleAddQuestion(item)}
                                                title="Add Question"
                                            >
                                                <i className='fas fa-question'></i>
                                            </Button>
                                            <Button
                                                color='warning'
                                                size='sm'
                                                className='mr-1'
                                                onClick={() => this.handleViewQuestions(item)}
                                                title="View Questions"
                                            >
                                                <i className='fas fa-list'></i>
                                            </Button>
                                            <Link
                                                to={`/news/${item._id}`}
                                                className='btn btn-sm btn-primary'
                                                target="_blank"
                                                title="View News"
                                            >
                                                <i className='fas fa-eye'></i>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                {/* Add/Edit News Modal */}
                <Modal isOpen={isModalOpen} toggle={this.toggleModal} size='lg'>
                    <ModalHeader toggle={this.toggleModal}>
                        {this.props.isEditMode ? 'Edit News Article' : 'Add New News Article'}
                    </ModalHeader>
                    <form onSubmit={this.handleSubmit}>
                        <ModalBody>
                            <Row>
                                <Col md='12'>
                                    <Input
                                        type='text'
                                        label='Title *'
                                        name='title'
                                        value={formData.title}
                                        onInputChange={this.handleChange}
                                        required
                                    />
                                </Col>

                                <Col md='6'>
                                    <FormGroup>
                                        <Label for="category">Category *</Label>
                                        <ReactstrapInput
                                            type="select"
                                            name="category"
                                            id="category"
                                            value={formData.category}
                                            onChange={(e) => this.handleChange('category', e.target.value)}
                                            required
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </ReactstrapInput>
                                    </FormGroup>
                                </Col>

                                <Col md='6'>
                                    <FormGroup>
                                        <Label for="difficulty">Difficulty Level</Label>
                                        <ReactstrapInput
                                            type="select"
                                            name="difficulty"
                                            id="difficulty"
                                            value={formData.difficulty}
                                            onChange={(e) => this.handleChange('difficulty', e.target.value)}
                                        >
                                            {difficulties.map(diff => (
                                                <option key={diff} value={diff}>{diff}</option>
                                            ))}
                                        </ReactstrapInput>
                                    </FormGroup>
                                </Col>

                                <Col md='12'>
                                    <Input
                                        type='text'
                                        label='Summary (Brief description)'
                                        name='summary'
                                        value={formData.summary}
                                        onInputChange={this.handleChange}
                                        placeholder='Short summary of the news article'
                                    />
                                </Col>

                                <Col md='12'>
                                    <TextArea
                                        label='Content *'
                                        name='content'
                                        value={formData.content}
                                        onInputChange={this.handleChange}
                                        rows='10'
                                        required
                                        placeholder='Write the full news article content here...'
                                    />
                                </Col>

                                <Col md='12'>
                                    <Input
                                        type='text'
                                        label='Image URL'
                                        name='imageUrl'
                                        value={formData.imageUrl}
                                        onInputChange={this.handleChange}
                                        placeholder='https://example.com/image.jpg'
                                    />
                                </Col>

                                <Col md='12'>
                                    <Input
                                        type='text'
                                        label='Source'
                                        name='source'
                                        value={formData.source}
                                        onInputChange={this.handleChange}
                                        placeholder='Original news source (optional)'
                                    />
                                </Col>

                                <Col md='12'>
                                    <Input
                                        type='text'
                                        label='Tags (comma separated)'
                                        name='tags'
                                        value={formData.tags}
                                        onInputChange={this.handleChange}
                                        placeholder='politics, economy, technology, education'
                                    />
                                </Col>

                                <Col md='6'>
                                    <FormGroup check>
                                        <Label check>
                                            <ReactstrapInput
                                                type='checkbox'
                                                name='isPublished'
                                                checked={formData.isPublished}
                                                onChange={(e) => this.handleChange('isPublished', e.target.checked)}
                                            />{' '}
                                            Publish Immediately
                                        </Label>
                                    </FormGroup>
                                </Col>

                                <Col md='6'>
                                    <FormGroup check>
                                        <Label check>
                                            <ReactstrapInput
                                                type='checkbox'
                                                name='isFeatured'
                                                checked={formData.isFeatured}
                                                onChange={(e) => this.handleChange('isFeatured', e.target.checked)}
                                            />{' '}
                                            Mark as Featured
                                        </Label>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </ModalBody>
                        <ModalFooter>
                            <Button color='secondary' onClick={this.toggleModal}>
                                Cancel
                            </Button>
                            <Button color='primary' type='submit' disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (this.props.isEditMode ? 'Update' : 'Create')}
                            </Button>
                        </ModalFooter>
                    </form>
                </Modal>

                {/* Add Question Modal */}
                <Modal isOpen={isQuestionModalOpen} toggle={this.toggleQuestionModal} size='lg'>
                    <ModalHeader toggle={this.toggleQuestionModal}>
                        Add Question to News
                    </ModalHeader>
                    <form onSubmit={this.handleQuestionSubmit}>
                        <ModalBody>
                            <Alert color="info">
                                <i className="fas fa-info-circle mr-2"></i>
                                Add a quiz question for this news article. Each question should test understanding of the content.
                            </Alert>

                            <Row>
                                <Col md='12'>
                                    <TextArea
                                        label='Question *'
                                        name='question'
                                        value={questionForm.question}
                                        onInputChange={(name, value) => this.handleQuestionInputChange(name, value)}
                                        rows='3'
                                        required
                                        placeholder='Enter the question based on the news content...'
                                    />
                                </Col>

                                <Col md='12'>
                                    <h6>Options * (Mark correct answer below)</h6>
                                    {[0, 1, 2, 3].map((index) => (
                                        <div key={index} className='mb-2'>
                                            <Input
                                                type='text'
                                                label={`Option ${index + 1}`}
                                                value={questionForm.options[index]}
                                                onInputChange={(name, value) => this.handleQuestionChange(index, value)}
                                                required
                                                placeholder={`Enter option ${index + 1}`}
                                            />
                                        </div>
                                    ))}
                                </Col>

                                <Col md='6'>
                                    <FormGroup>
                                        <Label for="correctAnswer">Correct Answer *</Label>
                                        <ReactstrapInput
                                            type="select"
                                            name="correctAnswer"
                                            id="correctAnswer"
                                            value={questionForm.correctAnswer}
                                            onChange={(e) => this.handleQuestionInputChange('correctAnswer', parseInt(e.target.value))}
                                            required
                                        >
                                            <option value={0}>Option 1</option>
                                            <option value={1}>Option 2</option>
                                            <option value={2}>Option 3</option>
                                            <option value={3}>Option 4</option>
                                        </ReactstrapInput>
                                        <small className="text-muted">
                                            Select which option is correct
                                        </small>
                                    </FormGroup>
                                </Col>

                                <Col md='12'>
                                    <TextArea
                                        label='Explanation'
                                        name='explanation'
                                        value={questionForm.explanation}
                                        onInputChange={(name, value) => this.handleQuestionInputChange(name, value)}
                                        rows='3'
                                        placeholder='Explain why this is the correct answer...'
                                    />
                                </Col>
                            </Row>
                        </ModalBody>
                        <ModalFooter>
                            <Button color='secondary' onClick={this.toggleQuestionModal}>
                                Cancel
                            </Button>
                            <Button color='primary' type='submit' disabled={isSubmitting}>
                                {isSubmitting ? 'Adding...' : 'Add Question'}
                            </Button>
                        </ModalFooter>
                    </form>
                </Modal>

                {/* View Questions Modal */}
                <Modal isOpen={isViewQuestionsModalOpen} toggle={this.toggleViewQuestionsModal} size='lg'>
                    <ModalHeader toggle={this.toggleViewQuestionsModal}>
                        Questions for: {selectedNewsForQuestions?.title}
                    </ModalHeader>
                    <ModalBody>
                        {selectedNewsQuestions.length > 0 ? (
                            <div>
                                <Alert color="info">
                                    <i className="fas fa-list mr-2"></i>
                                    This news article has {selectedNewsQuestions.length} question(s)
                                </Alert>

                                {selectedNewsQuestions.map((q, index) => (
                                    <Card key={index} className='mb-3'>
                                        <CardBody>
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <h6>Question {index + 1}</h6>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => this.handleDeleteQuestion(selectedNewsForQuestions._id, index)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </Button>
                                            </div>

                                            <p><strong>Q:</strong> {q.question}</p>

                                            <div className="mb-3">
                                                <strong>Options:</strong>
                                                <ul className="list-unstyled mt-2">
                                                    {q.options.map((option, optIndex) => (
                                                        <li key={optIndex} className={`mb-1 ${optIndex === q.correctAnswer ? 'text-success font-weight-bold' : ''}`}>
                                                            {String.fromCharCode(65 + optIndex)}. {option}
                                                            {optIndex === q.correctAnswer && ' ✓ (Correct)'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {q.explanation && (
                                                <div className="alert alert-light">
                                                    <strong>Explanation:</strong> {q.explanation}
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="fas fa-question-circle fa-3x text-muted mb-3"></i>
                                <h5>No Questions Yet</h5>
                                <p className="text-muted">This news article doesn't have any questions yet.</p>
                                <Button color="primary" onClick={this.toggleViewQuestionsModal}>
                                    Add Questions
                                </Button>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggleViewQuestionsModal}>
                            Close
                        </Button>
                        {selectedNewsQuestions.length > 0 && (
                            <Button color="primary" onClick={() => {
                                this.toggleViewQuestionsModal();
                                this.handleAddQuestion(selectedNewsForQuestions);
                            }}>
                                Add Another Question
                            </Button>
                        )}
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        newsList: state.newsAdmin.newsList || [],
        formData: state.newsAdmin.formData,
        isLoading: state.newsAdmin.isLoading,
        isSubmitting: state.newsAdmin.isSubmitting,
        isEditMode: state.newsAdmin.isEditMode,
        editId: state.newsAdmin.editId
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...actions,
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(NewsAdmin);