import { Link } from "react-router-dom"
import "./Sidebar.css"

function Sidebar() {
  const toggleSidebar = () => {
    document.body.classList.toggle('sidebar__open');
  }

  return (
    <div className="sidebar__container">
      <div className="sidebar">
        <Link to='/buy' onClick={toggleSidebar} className="nav__button">
          Buy
        </Link>
        <Link to='/rent' onClick={toggleSidebar} className="nav__button">
          Rent
        </Link>
        <Link to='/all' onClick={toggleSidebar} className="nav__button">
          All
        </Link>
        <Link to='/mylistings' onClick={toggleSidebar} className="nav__button">
          My Listings
        </Link>
        <Link to='/saved' onClick={toggleSidebar} className="nav__button">
          Saved
        </Link>
      </div>
    </div>
  )
}
export default Sidebar