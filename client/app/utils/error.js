/**
 *
 * error.js
 * This is a generic error handler, it receives the error returned from the server and present it on a pop up
 */

import { error } from 'react-notification-system-redux';

import { signOut } from '../containers/Login/actions';

const handleError = (err, dispatch, title = '') => {
  const unsuccessfulOptions = {
    title: `${title}`,
    message: ``,
    position: 'tr',
    autoDismiss: 1
  };

  if (err.response) {
    if (err.response.status === 400) {
      errorMessage = err.response.data.error || 'Please Try Again!';
    } else if (err.response.status === 404) {
      errorMessage = 'Resource not found';
    } else if (err.response.status === 401) {
      errorMessage = 'Unauthorized Access! Please login again';
      if (dispatch) {
        dispatch({ type: 'LOGOUT' }); // Or import your signOut action
      }
    } else if (err.response.status === 403) {
      errorMessage = 'Forbidden! You are not allowed to access this resource.';
    }
  } else if (err.message) {
    errorMessage = err.message;
  } else {
    errorMessage = 'Your request could not be processed. Please try again.';
  }
  return errorMessage;
};

export default handleError;
