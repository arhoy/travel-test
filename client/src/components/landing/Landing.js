import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';

const Landing = ({ isAuthenticated, loading }) => {
    if( loading ) return <Spinner />
    if( isAuthenticated ) return <Redirect to = "/todo"/> 
    return (
        <div className = "Landing">
             <div className = "Landing-content">
             
                <h1>Fullstack "ToDo" App</h1>
                <p>Fullstack task keeping App with Reacthooks and MongoDb Atlas</p>
                <div className = "Landing__auth">
                    <Link className = "Landing__button Landing__button-1" to = "/login"> Sign In </Link>
                    <Link className = "Landing__button Landing__button-2" to = "/register"> Register </Link>
                </div>
               
             </div>
   
        </div>
    );
};


Landing.propTypes = {
    isAuthenticated: PropTypes.bool
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading
})

export default connect( mapStateToProps )(Landing);