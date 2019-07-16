import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { addTodo, editTodo } from '../../actions/todo';

const TodoForm = ({addTodo, editTodo, isAuthenticated, todo: { currentTodo }, inputRef }) => {
    useEffect( ()=> {
        if( currentTodo ) {
            setText( currentTodo.text );
        }
    },[currentTodo])

    const [ text, setText ] = useState('');


    const onChangeHandler = e => setText(e.target.value);

    const onSubmitHandler = e => {
        e.preventDefault();

            // if todo edit todo
        if( currentTodo ){
            console.log(currentTodo._id);
            editTodo(currentTodo._id, { text });
        } else {
            addTodo({ text });
        }
     
        setText('');
    }

    if(!isAuthenticated) return <Redirect to = "/login" />

    return (
        <div className = "TodoForm">
            <form
                className = "form"
                onSubmit = { onSubmitHandler }
            >

                <div className = "form-group form-group--todo">
                    <input 
                        style = {{width: `${Math.max(text.length, 20)}rem` }}
                        type="text"
                        placeholder = ' Add new Todo ' 
                        onChange = { onChangeHandler }
                        name = "text"
                        value = { text }
                        required
                        ref = { inputRef }
                    />
                </div>
            </form>

        </div>
    )
}

TodoForm.propTypes = {
    addTodo: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    todo: state.todo
})

export default connect(mapStateToProps, { addTodo, editTodo } )(TodoForm);
