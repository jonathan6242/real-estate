import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { toast } from "react-toastify";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import Navbar from "../components/Navbar";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const signOut = async () => {
    await auth.signOut();
    navigate("/signin");
    toast.success("Successfully signed out");
  };
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
  });
  const { name } = formData;

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditing(false);
      if (name !== auth.currentUser.displayName) {
        updateProfile(auth.currentUser, { displayName: name });
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          name: name,
        });
      }
    } catch (error) {
      setFormData({
        name: auth.currentUser.displayName,
      });
      toast.error("Could not update user details");
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile__container">
        <div className="profile__row">
          <h1 className="profile__title">
            My Profile
            <button className="signout" onClick={signOut}>
              Log out
            </button>
          </h1>
          <div className="profile__subtitle">
            Personal details
          </div>
          <div className="profile__header">
            <div className="profile__details">
              <div className="profile__name">
                {!editing ? (
                  name
                ) : (
                  <form onSubmit={onSubmit}>
                    <input
                      className="profile__name--input"
                      type="text"
                      id="name"
                      value={name}
                      onChange={onChange}
                    />
                  </form>
                )}
              </div>
              <div className="profile__email">{auth.currentUser.email}</div>
              <button
                className="profile__name--edit"
                onClick={(e) => {
                  if(editing) {
                    onSubmit(e)
                  }
                  setEditing(!editing);
                }}
              >
                {!editing ? (
                  <i className="fa-solid fa-edit"></i>
                ) : (
                  <i className="fa-solid fa-check"></i>
                )}
              </button>
            </div>
            
          </div>
          <Link to='/create' className="profile__create">
            <i className="fa-solid fa-house"></i>
            Sell or rent your home
            <i className="fa-solid fa-chevron-right"></i>
          </Link>
          <Link to='/mylistings' className="profile__create">
            <i className="fa-solid fa-key"></i>
              View your listings
            <i className="fa-solid fa-chevron-right"></i>
          </Link>
        </div>
      </div>
    </>
  );
}
export default Profile;
