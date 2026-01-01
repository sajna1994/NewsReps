import {
    FETCH_DAILY_QUIZ,
    SET_QUIZ_LOADING,
    SET_QUIZ_ERROR
} from './constants';

const initialState = {
    dailyQuiz: null,
    isLoading: false,
    error: null
};

const quizReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_DAILY_QUIZ:
            return {
                ...state,
                dailyQuiz: action.payload,
                error: null
            };
        case SET_QUIZ_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
        case SET_QUIZ_ERROR:
            return {
                ...state,
                error: action.payload
            };
        default:
            return state;
    }
};

export default quizReducer;