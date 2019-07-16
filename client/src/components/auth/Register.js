import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link, Redirect } from 'react-router-dom';
import { setAlert } from '../../actions/alert';
import { connect } from 'react-redux'
import { register } from '../../actions/auth';
import Alert from '../layout/Alert';

const Register = ({ register, isAuthenticated }) => {

    const [ formData, setFormData ] = useState({
        name: '',
        email: '',
        password: '',
        password2: ''
    })

    const { name, email, password, password2 } = formData;

    const onChangeHandler = e => setFormData({
        ...formData,
        [ e.target.name ]:  e.target.value
    })

    const onSubmitHandler = async e => {
        e.preventDefault();
        if(password !== password2) {
            setAlert('Password not matching!', 'danger');
        } else {
            register(name, email, password);
        }
     
    }

    if(isAuthenticated) return <Redirect to = "/todo" />

    return (
        <div className = "Login">
        <h1>Sign Up Here</h1>
        <Alert
                customStyle = {{marginTop: '2rem', 'marginBottom': '-1rem', borderRadius: '6px'}}
        />
        <form
            className = "form"
            onSubmit = { onSubmitHandler }
        >
            <div className = "form-group form-group--register">
                <input 
                    type="text"
                    placeholder = "Your Name"
                    onChange = { onChangeHandler }
                    name = "name"
                    value = { name }
                    required
                />
            </div>

            <div className = "form-group form-group--register">
                <input 
                    type="email"
                    placeholder = "Your Email"
                    onChange = { onChangeHandler }
                    name = "email"
                    value = { email }
                    required
                />
            </div>

            <div className = "form-group form-group--register">
                <input 
                    type="password"
                    placeholder = "Your Password"
                    onChange = { onChangeHandler }
                    name = "password"
                    value = { password }
                    required
                />
            </div>

            <div className = "form-group form-group--register">
                <input 
                    type="password"
                    placeholder = "Confirm password"
                    onChange = { onChangeHandler }
                    name = "password2"
                    value = { password2 }
                    required
                />
            </div>
         <button type = 'submit' className = 'btn btn-transparent'> Register </button>
        </form>

        <p> Have an account? <Link to = '/login' >Sign In here </Link> </p>
    </div>
    )
}

Register.propTypes = {
    register: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
})

export default connect(mapStateToProps, { register })(Register)
