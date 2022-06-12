import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
import Sidebar from "./components/Sidebar";
import Listing from "./pages/Listing";
import CreateListing from "./pages/CreateListing";
import All from "./pages/All";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";
import Saved from "./pages/Saved"
import "./index.css"

function App() {
  return (
    <Router>
    <div className="App">
      <Routes>
        <Route path='/' exact element={<Home />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/profile' element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
        </Route>
        <Route path='/forgotpassword' element={<ForgotPassword />} />
        <Route path='/buy' element={<Buy />} />
        <Route path='/rent' element={<Rent />} />
        <Route path='/listings/:id' element={<Listing />} />
        <Route path='/create' element={<CreateListing />} />
        <Route path='/all' element={<All />} />
        <Route path='/mylistings' element={<PrivateRoute />}>
          <Route path='/mylistings' element={<MyListings />} />
        </Route>
        <Route path='/edit/:id' element={<EditListing />} />
        <Route path='/saved' element={<PrivateRoute />}>
          <Route path='/saved' element={<Saved />} />
        </Route>
      </Routes>
      <ToastContainer autoClose={3000} />
      <Sidebar />
    </div>
    </Router>
  );
}

export default App;
