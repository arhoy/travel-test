import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import { logout } from '../../actions/auth';
import Navbar from './Navbar';



const Layout = ({ auth: { isAuthenticated, loading }, logout }) => {

    if (loading || !isAuthenticated) return null;

    if(isAuthenticated) {
        return (
            <div className = "Layout Layout__auth">
                <Navbar/>
                <div>
                    <button className = "btn" onClick = { logout } type = "button"> Logout </button>
                </div>
            </div>
        )
    } 

    
}

Layout.propTypes = {
    auth: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth
})

export default connect(mapStateToProps, { logout } )(Layout)
