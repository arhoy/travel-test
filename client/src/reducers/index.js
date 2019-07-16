import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import todo from './todo';

export default combineReducers({
  alert,
  auth,
  todo
});
