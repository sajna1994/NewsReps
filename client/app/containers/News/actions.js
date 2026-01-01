// app/containers/News/actions.js
import axios from 'axios';
import { success, error } from 'react-notification-system-redux';

import {
    FETCH_NEWS,
    FETCH_NEWS_DETAIL,
    FETCH_TODAYS_NEWS,
    FETCH_FEATURED_NEWS,
    FETCH_TODAY_FEATURED_NEWS,
    SET_NEWS_LOADING,
    SET_NEWS_ERROR
} from './constants';
import { API_URL } from '../../constants';
import handleError from '../../utils/error';
import simpleError from '../../utils/simpleError'; // Add this import

export const fetchNews = () => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_NEWS_LOADING, payload: true });

            const response = await axios.get(`${API_URL}/news`);

            dispatch({
                type: FETCH_NEWS,
                payload: response.data.news
            });

            // Optionally show success notification
            dispatch(success({
                title: 'Success',
                message: 'News fetched successfully',
                position: 'tr'
            }));
        } catch (err) {
            console.error('Error fetching news:', err);

            // Use the handleError utility if available
            const errorMessage = handleError(err) ||
                err.response?.data?.error ||
                'Failed to fetch news';

            dispatch({
                type: SET_NEWS_ERROR,
                payload: errorMessage
            });

            // Show error notification
            dispatch(error({
                title: 'Error',
                message: errorMessage,
                position: 'tr'
            }));
        } finally {
            dispatch({ type: SET_NEWS_LOADING, payload: false });
        }
    };
};

export const fetchFeaturedNews = () => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_NEWS_LOADING, payload: true });

            const response = await axios.get(`${API_URL}/news/featured`);

            dispatch({
                type: FETCH_FEATURED_NEWS,
                payload: response.data.news
            });

            dispatch(success({
                title: 'Success',
                message: 'Featured news fetched successfully',
                position: 'tr'
            }));
        } catch (err) {
            const errorMessage = handleError(err) ||
                err.response?.data?.error ||
                'Failed to fetch featured news';

            dispatch({
                type: SET_NEWS_ERROR,
                payload: errorMessage
            });

            dispatch(error({
                title: 'Error',
                message: errorMessage,
                position: 'tr'
            }));
        } finally {
            dispatch({ type: SET_NEWS_LOADING, payload: false });
        }
    };
};

export const fetchTodayFeaturedNews = () => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_NEWS_LOADING, payload: true });

            const response = await axios.get(`${API_URL}/news/featured/today`);

            dispatch({
                type: FETCH_TODAY_FEATURED_NEWS,
                payload: response.data.news
            });

            dispatch(success({
                title: 'Success',
                message: 'Today\'s featured news fetched successfully',
                position: 'tr'
            }));
        } catch (err) {
            console.error('Error fetching today\'s featured news:', err);

            // Fallback to regular featured news if today's endpoint doesn't exist
            if (err.response?.status === 404) {
                console.log('Today\'s featured news endpoint not found, falling back to featured news');
                dispatch(fetchFeaturedNews());
                return;
            }

            const errorMessage = handleError(err) ||
                err.response?.data?.error ||
                'Failed to fetch today\'s featured news';

            dispatch({
                type: SET_NEWS_ERROR,
                payload: errorMessage
            });

            dispatch(error({
                title: 'Error',
                message: errorMessage,
                position: 'tr'
            }));
        } finally {
            dispatch({ type: SET_NEWS_LOADING, payload: false });
        }
    };
};

export const fetchNewsDetail = (id) => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_NEWS_LOADING, payload: true });

            const response = await axios.get(`${API_URL}/news/${id}`);

            dispatch({
                type: FETCH_NEWS_DETAIL,
                payload: response.data.news
            });

            dispatch(success({
                title: 'Success',
                message: 'News details fetched successfully',
                position: 'tr'
            }));
        } catch (err) {
            const errorMessage = handleError(err) ||
                err.response?.data?.error ||
                'Failed to fetch news details';

            dispatch({
                type: SET_NEWS_ERROR,
                payload: errorMessage
            });

            dispatch(error({
                title: 'Error',
                message: errorMessage,
                position: 'tr'
            }));
        } finally {
            dispatch({ type: SET_NEWS_LOADING, payload: false });
        }
    };
};

export const fetchTodaysNews = () => {
    return async (dispatch) => {
        try {
            console.log('Fetching today\'s news...');
            dispatch({ type: SET_NEWS_LOADING, payload: true });

            // Call API without date params first
            const response = await axios.get(`${API_URL}/news/today`);

            console.log('Today\'s news response:', response.data);
            console.log('Number of articles:', response.data.news?.length);

            dispatch({
                type: FETCH_TODAYS_NEWS,
                payload: response.data.news
            });

            dispatch(success({
                title: 'Success',
                message: `Found ${response.data.news?.length || 0} news articles`,
                position: 'tr'
            }));
        } catch (err) {
            console.error('Full error object:', err);

            // Use simpleError
            const errorMessage = simpleError(err) || 'Failed to fetch today\'s news';

            console.error('Final error message:', errorMessage);

            dispatch({
                type: SET_NEWS_ERROR,
                payload: errorMessage
            });

            dispatch(error({
                title: 'Error',
                message: errorMessage,
                position: 'tr'
            }));
        } finally {
            dispatch({ type: SET_NEWS_LOADING, payload: false });
        }
    };
};
// Optional: Add a search news action
export const searchNews = (query) => {
    return async (dispatch) => {
        try {
            dispatch({ type: SET_NEWS_LOADING, payload: true });

            const response = await axios.get(`${API_URL}/news/search`, {
                params: { query }
            });

            dispatch({
                type: FETCH_NEWS,
                payload: response.data.news
            });

            dispatch(success({
                title: 'Success',
                message: `Found ${response.data.news.length} results for "${query}"`,
                position: 'tr'
            }));
        } catch (err) {
            const errorMessage = handleError(err) ||
                err.response?.data?.error ||
                'Failed to search news';

            dispatch({
                type: SET_NEWS_ERROR,
                payload: errorMessage
            });

            dispatch(error({
                title: 'Error',
                message: errorMessage,
                position: 'tr'
            }));
        } finally {
            dispatch({ type: SET_NEWS_LOADING, payload: false });
        }
    };
};