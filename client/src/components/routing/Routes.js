import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Register from '../auth/Register';
import Login from '../auth/Login';
import Todo from '../todo/Todo';

import PrivateRoute from './PrivateRoute';

const Routes = () => {
  return (
    <section className='container'>
      <Switch>
        <Route exact path='/register' component={ Register } />
        <Route exact path='/login' component={ Login } />
        <PrivateRoute exact path = '/todo' component = { Todo } />
      </Switch>
    </section>
  );
};

export default Routes;
