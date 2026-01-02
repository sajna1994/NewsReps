// C:\Users\91974\Desktop\NewsReps\mern-ecommerce\client\app\containers\Application\reducer.js
/*
 *
 * Application reducer
 *
 */

import { DEFAULT_ACTION } from './constants';

const initialState = {};

const applicationReducer = (state = initialState, action) => {
  switch (action.type) {
    case DEFAULT_ACTION:
      return state;
    default:
      return state;
  }
};

export default applicationReducer;
