import axios from 'axios';

import {
    ADD_TODO,
    REMOVE_TODO,
    EDIT_TODO,
    CHANGE_TODO_STATUS,
    GET_TODO,
    GET_TODOS
} from './types';


export const getTodos = () => async dispatch => {
    try {

        const res = await axios.get('/api/tasks');

        dispatch({
            type: GET_TODOS,
            payload: res.data
        });

    } catch (error) {
        console.error('there as an error')
    }
}

export const addTodo = text => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const res = await axios.post('/api/tasks', text, config);
        dispatch({
            type: ADD_TODO,
            payload: res.data
        })


    } catch (error) {
        console.error('there was an error in the addTodo action', error)
    }
}

export const removeTodo = id => async dispatch => {

    try {

        await axios.delete(`/api/tasks/${id}`);

        dispatch({
            type: REMOVE_TODO,
            payload:id
        })

    } catch (error) {
        console.error('There as an error with the removeTodo action', error);
    }
   
}

export const getTodo = todo => async dispatch => {

    try {

        dispatch({
            type: GET_TODO,
            payload: todo
        })

    } catch (error) {
        console.error('There was ane error with getTodo action', error);
    }
}

export const editTodo = (id, text) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {

        const res = await axios.put(`/api/tasks/${id}`, text, config);

        dispatch({
            type: EDIT_TODO,
            payload: res.data
        })

    } catch (error) {
        console.error('There was an error in the editTodo action', error);
    }
}

export const changeTodoStatus = (id, status) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        // status object forms the req.body
        const res = await axios.put(`api/tasks/status/${id}`,status, config);
        dispatch({
            type: CHANGE_TODO_STATUS,
            payload: res.data
        })

    } catch (error) {
        console.error('There as an error in the changeTodoStatus action', error)
    }
}