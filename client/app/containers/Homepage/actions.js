// app/containers/Homepage/actions.js
import axios from 'axios';
import { API_URL } from '../../constants';
import {
  DEFAULT_ACTION,
  FETCH_CURRENT_CHALLENGE,
  SET_CHALLENGE_LOADING,
  PARTICIPATE_IN_CHALLENGE,
  SET_CHALLENGE_ERROR
} from './constants';

export const defaultAction = () => ({
  type: DEFAULT_ACTION
});

export const fetchCurrentDailyChallenge = () => async (dispatch) => {
  try {
    dispatch({ type: SET_CHALLENGE_LOADING, payload: true });

    const response = await axios.get(`${API_URL}/daily-challenge/current`);

    dispatch({
      type: FETCH_CURRENT_CHALLENGE,
      payload: response.data.challenge
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    dispatch({
      type: SET_CHALLENGE_ERROR,
      payload: error.response?.data?.error || 'Failed to fetch daily challenge'
    });
  } finally {
    dispatch({ type: SET_CHALLENGE_LOADING, payload: false });
  }
};

export const participateInDailyChallenge = (challengeData) => async (dispatch) => {
  try {
    dispatch({ type: SET_CHALLENGE_LOADING, payload: true });

    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/daily-challenge/participate`,
      challengeData,
      {
        headers: { Authorization: token }
      }
    );

    dispatch({
      type: PARTICIPATE_IN_CHALLENGE,
      payload: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Error participating in challenge:', error);
    dispatch({
      type: SET_CHALLENGE_ERROR,
      payload: error.response?.data?.error || 'Failed to participate in challenge'
    });
    throw error;
  } finally {
    dispatch({ type: SET_CHALLENGE_LOADING, payload: false });
  }
};