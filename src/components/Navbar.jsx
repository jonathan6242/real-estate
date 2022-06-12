import { Link } from "react-router-dom"
import { auth } from "../firebase"
import useAuthStatus from "../hooks/useAuthStatus"
import "./Navbar.css"

function Navbar() {
  const { loggedIn, loading } = useAuthStatus();

  const toggleSidebar = () => {
    document.body.classList.toggle('sidebar__open');
  }

  return (
    <nav>
      <button onClick={toggleSidebar} className="nav__menu">
        <i className="fa-solid fa-bars"></i>
        <i className="fa-solid fa-times"></i>
      </button>
      <Link to='/' className="nav__logo">
        <i className="fa-solid fa-house-chimney"></i>
        <div className="nav__logo--text">
          realestate.com.au
        </div>
      </Link>
      <div className="nav__main">
        <Link to='/buy' className="nav__button">
          Buy
        </Link>
        <Link to='/rent' className="nav__button">
          Rent
        </Link>
        <Link to='/all' className="nav__button">
          All
        </Link>
        {
          loggedIn && !loading && (
            <>
              <Link to='/mylistings' className="nav__button">
                My Listings
              </Link>
              <Link to='/saved' className="nav__button">
                Saved
              </Link>
            </>
          )
        }
      </div>
      <div className="nav__right">
        {
          (!loggedIn && !loading) ? (
            <>
              <Link to='/signin' className="nav__button">
                Sign in
              </Link>
              <Link to='/signup' className="nav__button nav__button--primary">
                Join
              </Link>
            </>
          ) : (loggedIn && !loading) ? (
            <>
              <Link to='/profile' className="nav__profile">
                <i className="fa-solid fa-user"></i>
              </Link>
            </>
          ) : (
            <>
              <div className="nav__profile skeleton"></div>
            </>
          )
        }
 
      </div>
    </nav>
  )
}
export default Navbar