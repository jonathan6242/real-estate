import { auth } from "../firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"
import { toast } from "react-toastify"
import { Link, Navigate, useNavigate } from "react-router-dom"
import Google from "../components/Google"
import "./SignIn.css"
import Spinner from "../components/Spinner"

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false);

  const { email, password } = formData
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
      toast.success('Sign in successful')
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong')
    }
    setLoading(false);
  }

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id] : e.target.value
    })
  }

  const toggleInputActive = (e) => {
    e.target.parentElement.classList.toggle('active');
  }

  if(loading) {
    return <Spinner />
  }

  return (
    <div className="sign-in">
      <form className="sign-in__form" onSubmit={onSubmit}>
        <Link to='/' className="nav__logo">
          <i className="fa-solid fa-house-chimney"></i>
          <div className="nav__logo--text">
            realestate.com.au
          </div>
        </Link>
        <h1 className="sign-in__title">Sign In</h1>
        <div className="sign-in__input--container">
          <i className="fa-solid fa-envelope"></i>
          <input
            type="email" 
            placeholder="Email address" 
            onChange={onChange}
            value={email}
            id="email"
            className="sign-in__input"
            onFocus={toggleInputActive}
            onBlur={toggleInputActive}
            required
          />
        </div>
        <div className="sign-in__input--container">
          <i className="fa-solid fa-lock"></i>
          <input 
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            onChange={onChange}
            value={password}
            id="password"
            className="sign-in__input"
            onFocus={toggleInputActive}
            onBlur={toggleInputActive}
            required
          />
          <button className="show-password" type="button" onClick={() => setShowPassword(!showPassword)}>
            {
              showPassword ? <i className="fa-solid fa-eye"></i>
              : <i className="fa-solid fa-eye-slash"></i>
            }
            
          </button>
        </div>
       
        <button className="sign-in__submit" type="submit">Sign In</button>
        <Link to='/forgotpassword' className="sign-in__link">Forgot your password?</Link>
        <div className="sign-in__or">
          <span>OR</span>
        </div>
        <Google setLoading={setLoading} />
        <div className="sign-in__create">
          Not signed up?&nbsp;
          <Link to='/signup' className="sign-in__link">
            Create an account.
          </Link>
        </div>
      </form>
     
    </div>
  )
}
export default SignIn