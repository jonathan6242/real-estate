import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Keyboard, Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import ThumbnailDetail from "../components/ui/ThumbnailDetail";
import { auth, db } from "../firebase";
import "./Listing.css";
import { useLoadScript } from "@react-google-maps/api";
import Map from "../components/Map";
import useAuthStatus from "../hooks/useAuthStatus";

function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoaded } = useLoadScript({ 
    googleMapsApiKey: process.env.REACT_APP_API_KEY
  })
  const { loggedIn } = useAuthStatus();

  useEffect(() => {

    const getListing = async () => {
      const listing = await getDoc(doc(db, "listings", id));
      if (listing.exists()) {
        setListing(listing.data());
        if(loggedIn) {
          setSaved(listing.data().savedBy.includes(auth.currentUser.uid))
        }
        setLoading(false);
      } else {
        navigate("/");
        setLoading(false);
        toast.error("Listing does not exist.");
      }
    };
    getListing();
  }, [loggedIn])

  const toggleSave = async () => {
    if(!auth.currentUser) {
      toast.error('You must sign in to save listings');
      return;
    }
    setSaved(!saved);
    if(!listing.savedBy.includes(auth.currentUser.uid)) {
      setListing({
        ...listing,
        savedBy: [auth.currentUser.uid, ...listing.savedBy]
      })
      await updateDoc(doc(db, "listings", listing.id), {
        ...listing,
        savedBy: [auth.currentUser.uid, ...listing.savedBy]
      })
    } else {
      setListing({
        ...listing,
        savedBy: [...listing.savedBy].filter(uid => uid !== auth.currentUser.uid)
      })
      await updateDoc(doc(db, "listings", listing.id), {
        ...listing,
        savedBy: [...listing.savedBy].filter(uid => uid !== auth.currentUser.uid)
      })
    }
  }

  const capitalise = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (loading || !isLoaded) {
    return <Spinner />;
  }

  return (
    <>
      <Navbar />
      <div className="listing">
        <div className="listing__hero--container">
          <div className="listing__hero">
            <div className="listing__hero--left">
              <div className="listing__header">
                <button onClick={toggleSave} className="listing__save">
                  {
                    !saved ? <i className="fa-regular fa-star"></i>
                    : <i className="fa-solid fa-star"></i>
                  }
                </button>
              </div>
              <h1 className="listing__location">{listing.location}</h1>
              <div className="listing__row">
                <div className="listing__details">
                  <ThumbnailDetail
                    icon={<i className="fa-solid fa-bed"></i>}
                    number={listing?.bedrooms}
                  />
                  <ThumbnailDetail
                    icon={<i className="fa-solid fa-bath"></i>}
                    number={listing?.bathrooms}
                  />
                  <ThumbnailDetail
                    icon={<i className="fa-solid fa-car"></i>}
                    number={listing?.cars}
                  />
                  <ThumbnailDetail
                    icon={<i className="fa-solid fa-border-all"></i>}
                    number={
                      <>
                        {listing?.sqm}
                        <span className="thumbnail__detail--metric">
                          m<sup>2</sup>
                        </span>
                      </>
                    }
                  />
                </div>
                <div className="listing__property">
                  {capitalise(listing.property)}
                </div>
              </div>
              <div className="listing__name">{listing.name}</div>
            </div>
            <Swiper
              slidesPerView={1}
              modules={[Keyboard, Navigation, Pagination]}
              loop={true}
              navigation={true}
              pagination={{
                clickable: true
              }}
              keyboard={{
                enabled: true
              }}
              effect="fade"
              className="listing__img--wrapper"
            >
              {listing?.imgUrls.map((url, index) => (
                <SwiperSlide
                  key={index}
                  style={{
                    backgroundImage: `url(${url})`,
                    width: "100%",
                  }}
                ></SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
      <div className="listing__main--container">
        <div className="listing__main">
          <div className="listing__map">
            <Map geolocation={listing.geolocation} />
          </div>
          <div className="listing__about">
            <div className="listing__title">
              {listing.title}
            </div>
            <div className="listing__description">
              {listing.description}
            </div>
          </div>
          <div className="listing__agent">
            <div className="listing__agent--info">
              <figure className="listing__profile--wrapper">
                <img src={listing.agentImg} alt="" className="listing__profile" />
              </figure>
              <div className="listing__agent--details">
                <div className="listing__agent--name">
                  {listing.agent}
                </div>
                <div className="listing__agent--phone">
                  +61 123 456 789
                </div>
              </div>
            </div>
            <a href={`mailto:${listing.agentEmail}`} className="listing__agent--contact">
              Contact Agent
            </a>
          </div>
        </div>
      </div>
      
    </>
  );
}
export default Listing;
