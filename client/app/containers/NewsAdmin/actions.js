import axios from 'axios';
import { success, error } from 'react-notification-system-redux';

import {
    FETCH_NEWS,
    FETCH_NEWS_DETAIL,
    CREATE_NEWS,
    UPDATE_NEWS,
    DELETE_NEWS,
    SET_NEWS_FORM_DATA,
    RESET_NEWS_FORM,
    SET_NEWS_LOADING,
    SET_NEWS_SUBMITTING,
    SET_NEWS_FORM_ERRORS
} from './constants';
import { API_URL } from '../../constants';
import handleError from '../../utils/error';

// Fetch all news
export const fetchNews = () => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_NEWS_LOADING, payload: true });

            const response = await axios.get(`${API_URL}/news`);

            dispatch({
                type: FETCH_NEWS,
                payload: response.data.news
            });
        } catch (err) {
            handleError(err, dispatch, 'Failed to fetch news');
        } finally {
            dispatch({ type: SET_NEWS_LOADING, payload: false });
        }
    };
};

// Fetch single news by ID
export const fetchNewsDetail = (id) => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_NEWS_LOADING, payload: true });

            const response = await axios.get(`${API_URL}/news/${id}`);

            dispatch({
                type: FETCH_NEWS_DETAIL,
                payload: response.data.news
            });
        } catch (err) {
            handleError(err, dispatch, 'Failed to fetch news details');
        } finally {
            dispatch({ type: SET_NEWS_LOADING, payload: false });
        }
    };
};

export const createNews = (newsData) => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_NEWS_SUBMITTING, payload: true });

            const token = localStorage.getItem('token');

            // Log for debugging
            console.log('Creating news with token:', token ? 'Present' : 'Missing');
            console.log('News data:', newsData);

            const response = await axios.post(`${API_URL}/news`, newsData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response:', response.data);

            dispatch({
                type: CREATE_NEWS,
                payload: response.data.news
            });

            dispatch(success({
                title: 'Success!',
                message: response.data.message || 'News created successfully',
                position: 'tr',
                autoDismiss: 3
            }));

            dispatch(fetchNews());
            dispatch({ type: RESET_NEWS_FORM });

        } catch (err) {
            // Better error logging
            console.error('Error creating news:', err);
            console.error('Error response:', err.response?.data);

            const errorMessage = err.response?.data?.error ||
                err.message ||
                'Failed to create news';

            dispatch(error({
                title: 'Error!',
                message: errorMessage,
                position: 'tr',
                autoDismiss: 5
            }));

            dispatch({
                type: SET_NEWS_FORM_ERRORS,
                payload: { submit: errorMessage }
            });
        } finally {
            dispatch({ type: SET_NEWS_SUBMITTING, payload: false });
        }
    };
};

// Update news
export const updateNews = (id, newsData) => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_NEWS_SUBMITTING, payload: true });

            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/news/${id}`, newsData, {
                headers: {
                    Authorization: token
                }
            });

            dispatch({
                type: UPDATE_NEWS,
                payload: response.data.news
            });

            dispatch(success({
                title: 'Success!',
                message: response.data.message || 'News updated successfully',
                position: 'tr',
                autoDismiss: 3
            }));

            // Refresh news list
            dispatch(fetchNews());

        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to update news';
            dispatch(error({
                title: 'Error!',
                message: errorMessage,
                position: 'tr',
                autoDismiss: 5
            }));
        } finally {
            dispatch({ type: SET_NEWS_SUBMITTING, payload: false });
        }
    };
};

// Delete news
export const deleteNews = (id) => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_NEWS_LOADING, payload: true });

            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/news/${id}`, {
                headers: {
                    Authorization: token
                }
            });

            dispatch({
                type: DELETE_NEWS,
                payload: id
            });

            dispatch(success({
                title: 'Success!',
                message: response.data.message || 'News deleted successfully',
                position: 'tr',
                autoDismiss: 3
            }));

            // Refresh news list
            dispatch(fetchNews());

        } catch (err) {
            handleError(err, dispatch, 'Failed to delete news');
        } finally {
            dispatch({ type: SET_NEWS_LOADING, payload: false });
        }
    };
};

// Form actions
export const setNewsFormData = (name, value) => {
    let formData = {};
    formData[name] = value;

    return {
        type: SET_NEWS_FORM_DATA,
        payload: formData
    };
};

export const resetNewsForm = () => {
    return {
        type: RESET_NEWS_FORM
    };
};

// Add question to news
export const addQuestionToNews = (newsId, questionData) => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_NEWS_SUBMITTING, payload: true });

            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/news/${newsId}/questions`, questionData, {
                headers: {
                    Authorization: token
                }
            });

            dispatch(success({
                title: 'Success!',
                message: response.data.message || 'Question added successfully',
                position: 'tr',
                autoDismiss: 3
            }));

            // Refresh news detail
            dispatch(fetchNewsDetail(newsId));

        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to add question';
            dispatch(error({
                title: 'Error!',
                message: errorMessage,
                position: 'tr',
                autoDismiss: 5
            }));
        } finally {
            dispatch({ type: SET_NEWS_SUBMITTING, payload: false });
        }
    };
};