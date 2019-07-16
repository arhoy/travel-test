import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux'
import Alert from '../layout/Alert';
import { login } from '../../actions/auth';

const Login = ({login, isAuthenticated}) => {

    const [ formData, setFormData ] = useState({
        email: '',
        password: ''
    })

    const { email, password } = formData;

    const onChangeHandler = e => setFormData({
        ...formData,
        [ e.target.name ]:  e.target.value
    })

    const onSubmitHandler = async e => {
        e.preventDefault();
        login(email, password);
    }

    if(isAuthenticated) return <Redirect to = "/todo" />

    


    return (
        <div className = "Login">
            <h1>Sign Into your account</h1>

            <Alert
                customStyle = {{marginTop: '2rem', 'marginBottom': '-1rem', borderRadius: '6px'}}
            />

            <form
                className = "form"
                onSubmit = { onSubmitHandler }
                noValidate="novalidate"
            >
                <div className = "form-group form-group--login">
                    <input 
                        type="email"
                        placeholder = "Your Email"
                        onChange = { onChangeHandler }
                        name = "email"
                        value = { email }
                        required
                    />
                </div>

                <div className = "form-group form-group--login">
                    <input 
                        type="password"
                        placeholder = "Your Password"
                        onChange = { onChangeHandler }
                        name = "password"
                        value = { password }
                        required
                    />   
                </div>
          

             <button type = 'submit' className = 'btn btn-transparent'> Login </button>
            </form>

            <p> Do not have an account yet?  <Link to = '/register' >Sign Up </Link> </p>
        </div>
    )
}

Login.propTypes = {
    login: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
})

export default connect(mapStateToProps, { login } )(Login);
