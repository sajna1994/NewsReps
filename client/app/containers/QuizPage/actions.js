// Quiz actions
export const fetchDailyQuiz = () => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_QUIZ_LOADING, payload: true });

            const response = await axios.get(`${API_URL}/quiz/daily`);

            dispatch({
                type: FETCH_DAILY_QUIZ,
                payload: response.data.quiz
            });
        } catch (err) {
            dispatch({
                type: SET_QUIZ_ERROR,
                payload: err.response?.data?.error || 'Failed to fetch daily quiz'
            });
        } finally {
            dispatch({ type: SET_QUIZ_LOADING, payload: false });
        }
    };
};

export const submitQuizResults = (quizId, answers) => {
    return async (dispatch) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/quiz/submit`, {
                quizId,
                answers
            }, {
                headers: {
                    Authorization: token
                }
            });

            dispatch(success({
                title: 'Quiz Submitted!',
                message: response.data.message,
                position: 'tr',
                autoDismiss: 3
            }));

        } catch (err) {
            console.error('Error submitting quiz:', err);
        }
    };
};