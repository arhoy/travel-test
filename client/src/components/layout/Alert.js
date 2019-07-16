// validation alerts yay
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux';

const Alert = ({ alerts, customStyle }) =>  {
    if( alerts !== null && alerts.length > 0 ) {
        return (
            alerts.map( alert => (
                <div 
                    key = { alert.id }
                    className = { `alert alert-${alert.alertType}` }
                    style = { customStyle }
                >
                    { alert.msg }
                </div>
            ))
        )
    } else {
        return null;
    }
   
}
  

Alert.propTypes = {
    alerts: PropTypes.array.isRequired
}

Alert.defaultProps = {
    customStyle: null
}

const mapStateToProps = state => ({
    alerts: state.alert
})

export default connect(mapStateToProps)(Alert)
