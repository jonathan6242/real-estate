import { auth, db } from "../firebase"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { useState } from "react"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { toast } from "react-toastify"
import Google from "../components/Google"
import "./SignIn.css"
import { Link, useNavigate } from "react-router-dom"
import Spinner from "../components/Spinner"

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false);

  const { name, email, password } = formData
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      updateProfile(auth.currentUser, {displayName: name})

      const formDataCopy = {...formData}
      delete formDataCopy.password

      await setDoc(doc(db, "users", user.uid), {
        ...formDataCopy,
        timestamp: serverTimestamp()
      })
      setLoading(false);
      navigate('/');
      toast.success('Sign up successful')
    } catch (error) {
      setLoading(false);
      console.log(error)
      toast.error('Something went wrong')
    }
    

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
        <h1 className="sign-in__title">Sign Up</h1>
        <div className="sign-in__input--container">
            <i className="fa-solid fa-user"></i>
            <input
              type="text" 
              placeholder="Name" 
              onChange={onChange}
              value={name}
              id="name"
              className="sign-in__input"
              onFocus={toggleInputActive}
              onBlur={toggleInputActive}
              required
            />
        </div>
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
        <button className="sign-in__submit" type="submit">Sign Up</button>
        <div className="sign-in__or">
            <span>OR</span>
          </div>
        <Google />
        <div className="sign-in__create">
          Already have an account?&nbsp;
          <Link to='/signin' className="sign-in__link">
            Sign in.
          </Link>
        </div>
      </form>
    </div>
  )
}
export default SignUp