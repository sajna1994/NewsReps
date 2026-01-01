// app/containers/Homepage/reducer.js
import {
  DEFAULT_ACTION,
  FETCH_CURRENT_CHALLENGE,
  SET_CHALLENGE_LOADING,
  PARTICIPATE_IN_CHALLENGE,
  SET_CHALLENGE_ERROR
} from './constants';

const initialState = {
  currentChallenge: null,
  isLoading: false,
  error: null,
  participationResult: null
};

const homepageReducer = (state = initialState, action) => {
  switch (action.type) {
    case DEFAULT_ACTION:
      return state;

    case FETCH_CURRENT_CHALLENGE:
      return {
        ...state,
        currentChallenge: action.payload,
        error: null
      };

    case PARTICIPATE_IN_CHALLENGE:
      return {
        ...state,
        participationResult: action.payload,
        error: null
      };

    case SET_CHALLENGE_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case SET_CHALLENGE_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    default:
      return state;
  }
};

export default homepageReducer;