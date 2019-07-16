import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux';

const Navbar = ({ auth: { user, loading, isAuthenticated }  }) => {
    if ( loading || !isAuthenticated ) return null;

    return (
        <div>
            Welcome { user && user.name }
        </div>
    )
}

Navbar.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth
})

export default connect( mapStateToProps )(Navbar)
