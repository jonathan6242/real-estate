import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"

function ForgotPassword() {
  const [email, setEmail] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Email was sent.')
    } catch (error) {
      toast.error('Could not send password reset email.')
    }
  }

  const toggleInputActive = (e) => {
    e.target.parentElement.classList.toggle('active');
  }

  return (
    <div className="sign-in">
      <form onSubmit={onSubmit} className="sign-in__form">
        <Link to='/' className="nav__logo">
          <i className="fa-solid fa-house-chimney"></i>
          <div className="nav__logo--text">
            realestate.com.au
          </div>
        </Link>
        <h1 className="sign-in__title">Forgot your password?</h1>
        <p className="sign-in__text">Enter your email and we'll send you a code you can use to update your password.</p>
        <div className="sign-in__input--container">
          <i className="fa-solid fa-envelope"></i>
          <input
            type="email" 
            placeholder="Email address" 
            onChange={(e) => {setEmail(e.target.value)}}
            value={email}
            id="email"
            className="sign-in__input"
            onFocus={toggleInputActive}
            onBlur={toggleInputActive}
            required
          />
        </div>
        <button className="sign-in__submit">Reset my password</button>
        <Link className="sign-in__link" to='/signin'>
          Go back to sign in.
        </Link>
      </form>
    </div>
  )
}
export default ForgotPassword