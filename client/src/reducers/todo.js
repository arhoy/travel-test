import {
    GET_TODOS,
    ADD_TODO,
    EDIT_TODO,
    CHANGE_TODO_STATUS,
    REMOVE_TODO,
    GET_TODO,
    LOGOUT
} from '../actions/types';

const initialState = {
    todos: [],
    currentTodo: null,
    loading:true,
    error: {}
}

export default function ( state = initialState, action ) {
    const { type, payload } = action;

    switch( type ) { 
        case ADD_TODO:
            return {
                ...state,
                todos: [ payload, ...state.todos ],
                loading: false
            };
        case GET_TODOS:
            return {
                ...state,
                todos: payload,
                loading: false
            };
        
        case GET_TODO:
            return {
                ...state,
                currentTodo: payload
            };

        case REMOVE_TODO:
            return {
                ...state,
                todos: state.todos.filter( todo => todo._id !== payload ),
                loading: false
            }
        case EDIT_TODO:
            return {
                ...state,
                todos: state.todos.map( todo => 
                    todo._id === state.currentTodo._id ? { ...todo, text: payload.text } : todo
                ),
                currentTodo:null
            }
        case CHANGE_TODO_STATUS:
            return {
                ...state,
                todos: state.todos.map( todo => 
                    todo._id === payload._id ? {...todo, completed: payload.completed, status: payload.status } : todo
                )
            }
        case LOGOUT:
            return {
                ...state,
                todos:[],
                currentTodo:null,
                loading:false,
                error: {}
            }

        default:
            return state;
    }

}