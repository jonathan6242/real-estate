import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import "./Home.css";

function Home() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getListings = async () => {
      const data = await getDocs(
        query(
          collection(db, "listings"),
          orderBy("timestamp", "desc"),
          limit(5)
        )
      );
      setListings(
        data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
      setLoading(false);
    };
    getListings();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <Navbar />
      <div className="home__container">
        <div className="home__row">
          <div className="hero__container">
            <div className="hero">
              <div className="hero__left">
                <div className="hero__overlay"></div>
                <Link to="/buy" className="hero__button">
                  Buy
                </Link>
              </div>
              <div className="hero__right">
                <div className="hero__overlay"></div>
                <Link to="/rent" className="hero__button">
                  Rent
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="swiper__row">
          <div className="home__title">Latest Listings</div>
          <Swiper
            slidesPerView={1}
            modules={[Navigation, Pagination]}
            navigation
            loop={true}
            pagination
            effect="fade"
            className="home__swiper"
          >
            {listings.map((listing, index) => (
              <SwiperSlide
                key={index}
                onClick={() => {navigate(`/listings/${listing.id}`)}}
                style={{
                  backgroundImage: `url(${listing.imgUrls[0]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  width: "100%",
                }}
                className="home__swiper--slide"
              >
                <p className="home__swiper--location">{listing.location}</p>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
}
export default Home;
