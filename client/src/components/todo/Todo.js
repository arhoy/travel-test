// highest level Todo file

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TodoHeader from './TodoHeader';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import { getTodos, addTodo, changeTodoStatus } from '../../actions/todo';
import Spinner from '../layout/Spinner';


const Todo = ({ auth, getTodos, addTodo, changeTodoStatus, todo: { todos, loading } }) => {

    useEffect( ()=> {
        getTodos();
    }, [getTodos, addTodo, changeTodoStatus, auth]);

    const inputRef = useRef();

    return loading || todos === null ?  <Spinner/> : (
       <div className = "Todo" >
           <TodoHeader/>
           <TodoForm inputRef = {inputRef} />
           <TodoList inputRef = {inputRef} todos = {todos} />
       </div>
    );
};


Todo.propTypes = {
    getTodos: PropTypes.func.isRequired,
    addTodo: PropTypes.func.isRequired,
    changeTodoStatus: PropTypes.func.isRequired,
    todo: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    todo: state.todo,
    auth: state.auth
})
export default connect( mapStateToProps, { getTodos, addTodo, changeTodoStatus } )(Todo);