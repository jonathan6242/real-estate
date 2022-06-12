import { useEffect } from "react";
import "./Thumbnail.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ThumbnailDetail from "./ui/ThumbnailDetail";
import { Link, useNavigate } from "react-router-dom";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useState } from "react";
import { useRef } from "react";
import { toast } from "react-toastify";
import useAuthStatus from "../hooks/useAuthStatus";

function Thumbnail({ listing, owner, deleteListing }) {
  const capitalise = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const contentRef = useRef();
  const [height, setHeight] = useState()
  const [listingCopy, setListingCopy] = useState(listing)
  const { loggedIn } = useAuthStatus();

  useEffect(() => {
    if(!loggedIn) {
      return
    }
    setSaved(listing?.savedBy?.includes(auth.currentUser.uid))
  }, [loggedIn])

  useEffect(() => {
    getContentHeight();
  }, [])

  const getContentHeight = () => {
    const newHeight = contentRef?.current?.clientHeight;
    if(newHeight) {
      setHeight(newHeight);
    }
  };

  // Update 'height' when the window resizes
  useEffect(() => {
    window.addEventListener("resize", getContentHeight);
  }, []);

  const toggleSave = async () => {
    if(!auth.currentUser) {
      toast.error('You must sign in to save listings');
      return;
    }
    setSaved(!saved);
    if(!listingCopy.savedBy.includes(auth.currentUser.uid)) {
      setListingCopy({
        ...listingCopy,
        savedBy: [auth.currentUser.uid, ...listingCopy.savedBy]
      })
      await updateDoc(doc(db, "listings", listingCopy.id), {
        ...listingCopy,
        savedBy: [auth.currentUser.uid, ...listingCopy.savedBy]
      })
    } else {
      setListingCopy({
        ...listingCopy,
        savedBy: [...listingCopy.savedBy].filter(uid => uid !== auth.currentUser.uid)
      })
      await updateDoc(doc(db, "listings", listingCopy.id), {
        ...listingCopy,
        savedBy: [...listingCopy.savedBy].filter(uid => uid !== auth.currentUser.uid)
      })
    }

  };

  return (
    <div className="thumbnail__wrapper">
      <Link to={`/listings/${listing.id}`} className="thumbnail">
        <div className="thumbnail__header">
          <div className="thumbnail__agent--name">{listing?.agent}</div>
          <figure className="thumbnail__agent--wrapper">
            <img src={listing?.agentImg} alt="" className="thumbnail__agent" />
          </figure>
        </div>
        <Swiper
          slidesPerView={1}
          modules={[Keyboard, Navigation, Pagination]}
          loop={true}
          navigation
          pagination
          effect="fade"
          className="thumbnail__img--wrapper"
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
        <div className="thumbnail__content" ref={contentRef}>
          <div className="thumbnail__content--left">
            <div className="thumbnail__name">{listing?.name}</div>
            <div className="thumbnail__location">{listing?.location}</div>
            <div className="thumbnail__bottom">
              <div className="thumbnail__details">
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
              <span className="thumbnail__details--bar">|</span>
              <div className="thumbnail__property">
                {capitalise(listing?.property)}
              </div>
            </div>
          </div>
          <div className="thumbnail__content--right"></div>
        </div>
      </Link>
      <button onClick={toggleSave} className="thumbnail__save" style={{
        bottom: `${height - 48}px`
      }}>
        {!saved ? (
          <i className="fa-regular fa-star"></i>
        ) : (
          <i className="fa-solid fa-star"></i>
        )}
      </button>
      {owner && (
        <>
          <button
            onClick={() => {
              deleteListing(listing.id);
            }}
            className="thumbnail__delete"
          >
            <i className="fa-solid fa-trash-can"></i>
          </button>
          <button
            onClick={() => {
              navigate(`/edit/${listing.id}`);
            }}
            className="thumbnail__edit"
          >
            <i className="fa-solid fa-edit"></i>
          </button>
        </>
      )}
    </div>
  );
}
export default Thumbnail;
