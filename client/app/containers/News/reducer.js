import {
    FETCH_NEWS, // Add this

    FETCH_FEATURED_NEWS,
    FETCH_TODAY_FEATURED_NEWS,
    FETCH_NEWS_DETAIL,
    SET_NEWS_LOADING,
    SET_NEWS_ERROR,
    FETCH_TODAYS_NEWS
} from './constants';

const initialState = {
    featuredNews: [],
    todayFeaturedNews: [],
    currentNews: null,  // Add this
    newsList: [],
    isLoading: false,
    todaysNews: [],
    error: null
};

const newsReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_NEWS: // Add this case
            return {
                ...state,
                newsList: action.payload,
                error: null
            };
        case FETCH_FEATURED_NEWS:
            return {
                ...state,
                featuredNews: action.payload,
                error: null
            };
        case FETCH_TODAY_FEATURED_NEWS:
            return {
                ...state,
                todayFeaturedNews: action.payload,
                error: null
            };
        case FETCH_NEWS_DETAIL:  // Add this case
            return {
                ...state,
                currentNews: action.payload,
                error: null
            };
        case SET_NEWS_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
        case SET_NEWS_ERROR:
            return {
                ...state,
                error: action.payload
            };
        // app/containers/News/reducer.js
        case FETCH_TODAYS_NEWS:
            return {
                ...state,
                todaysNews: action.payload,
                error: null
            };
        default:
            return state;
    }
};

export default newsReducer;