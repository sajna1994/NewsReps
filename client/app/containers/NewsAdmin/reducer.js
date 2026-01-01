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
    SET_NEWS_FORM_ERRORS,
    SET_NEWS_EDIT_MODE,
    SET_NEWS_EDIT_ID
} from './constants';

const initialState = {
    newsList: [],
    currentNews: null,
    formData: {
        title: '',
        content: '',
        summary: '',
        category: 'General',
        imageUrl: '',
        source: '',
        difficulty: 'Medium',
        tags: '',
        isPublished: false,
        isFeatured: false
    },
    formErrors: {},
    isLoading: false,
    isSubmitting: false,
    isEditMode: false,
    editId: null
};

const newsAdminReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_NEWS:
            return {
                ...state,
                newsList: action.payload
            };

        case FETCH_NEWS_DETAIL:
            return {
                ...state,
                currentNews: action.payload
            };

        case CREATE_NEWS:
            return {
                ...state,
                newsList: [action.payload, ...state.newsList]
            };

        case UPDATE_NEWS:
            return {
                ...state,
                newsList: state.newsList.map(item =>
                    item._id === action.payload._id ? action.payload : item
                ),
                currentNews: action.payload
            };

        case DELETE_NEWS:
            return {
                ...state,
                newsList: state.newsList.filter(item => item._id !== action.payload)
            };

        case SET_NEWS_FORM_DATA:
            return {
                ...state,
                formData: {
                    ...state.formData,
                    ...action.payload
                }
            };

        case RESET_NEWS_FORM:
            return {
                ...state,
                formData: {
                    title: '',
                    content: '',
                    summary: '',
                    category: 'General',
                    imageUrl: '',
                    source: '',
                    difficulty: 'Medium',
                    tags: '',
                    isPublished: false,
                    isFeatured: false
                },
                formErrors: {},
                isEditMode: false,
                editId: null
            };

        case SET_NEWS_FORM_ERRORS:
            return {
                ...state,
                formErrors: action.payload
            };

        case SET_NEWS_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
        // In your reducer (app/containers/NewsAdmin/reducer.js)
        case 'ADD_QUESTION_TO_NEWS_REQUEST':
            return {
                ...state,
                isSubmitting: true
            };
        case 'ADD_QUESTION_TO_NEWS_SUCCESS':
            return {
                ...state,
                isSubmitting: false,
                newsList: state.newsList.map(news =>
                    news._id === action.payload._id ? action.payload : news
                )
            };
        case 'ADD_QUESTION_TO_NEWS_ERROR':
            return {
                ...state,
                isSubmitting: false,
                error: action.error
            };
        case SET_NEWS_SUBMITTING:
            return {
                ...state,
                isSubmitting: action.payload
            };

        case SET_NEWS_EDIT_MODE:
            return {
                ...state,
                isEditMode: action.payload
            };

        case SET_NEWS_EDIT_ID:
            return {
                ...state,
                editId: action.payload
            };

        default:
            return state;
    }
};

export default newsAdminReducer;