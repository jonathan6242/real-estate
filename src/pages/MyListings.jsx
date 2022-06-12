import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import Thumbnail from "../components/Thumbnail";
import { auth, db } from "../firebase";
import useAuthStatus from "../hooks/useAuthStatus";
import "./Category.css";

function MyListings() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);
  const [listingsPerPage, setListingsPerPage] = useState(3);
  const [noMoreListings, setNoMoreListings] = useState(false);
  const [filter, setFilter] = useState("NEWEST");
  const [filterNumber, setFilterNumber] = useState(1);
  const [filterBy, setFilterBy] = useState("bedrooms");
  const [number, setNumber] = useState(1);
  const prevSearchFilterBy = useRef();
  const [searchFilterBy, setSearchFilterBy] = useState(null);
  const [searchNumber, setSearchNumber] = useState(1);
  const { loggedIn } = useAuthStatus();

  const getListings = async (rooms) => {
    setNoMoreListings(false);
    try {
      let data;
      switch (filter) {
        case "NEWEST":
          data = await getDocs(
            query(
              collection(db, "listings"),
              where("uid", "==", auth.currentUser.uid),
              orderBy("timestamp", "desc"),
              limit(listingsPerPage)
            )
          );
          break;
        case "OLDEST":
          data = await getDocs(
            query(
              collection(db, "listings"),
              where("uid", "==", auth.currentUser.uid),
              orderBy("timestamp", "asc"),
              limit(listingsPerPage)
            )
          );
          break;
        case "LOW_TO_HIGH":
          data = await getDocs(
            query(
              collection(db, "listings"),
              where("uid", "==", auth.currentUser.uid),
              orderBy("price", "asc"),
              limit(listingsPerPage)
            )
          );
          break;
        case "HIGH_TO_LOW":
          data = await getDocs(
            query(
              collection(db, "listings"),
              where("uid", "==", auth.currentUser.uid),
              orderBy("price", "desc"),
              limit(listingsPerPage)
            )
          );
          break;
        case "bedrooms":
        case "bathrooms":
        case "cars":
          data = await getDocs(
            query(
              collection(db, "listings"),
              where("uid", "==", auth.currentUser.uid),
              where(searchFilterBy, "==", +searchNumber),
              limit(listingsPerPage)
            )
          );
          break;
      }
      if (data.docs.length === 0) {
        resetFilter();
        toast.error("No listings found.");
      }
      const listings = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      let lastFetched = data.docs[data.docs.length - 1];
      if (data.docs.length < listingsPerPage) {
        setNoMoreListings(true);
      }
      setLastFetchedListing(lastFetched);
      setListings(listings);
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Could not get listings.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if(!loggedIn) {
      return;
    }
    getListings();
  }, [loggedIn]);

  const getMoreListings = async () => {
    try {
      let data;
      switch (filter) {
        case "NEWEST":
          data = await getDocs(
            query(
              collection(db, "listings"),
              where("uid", "==", auth.currentUser.uid),
              orderBy("timestamp", "desc"),
              startAfter(lastFetchedListing),
              limit(listingsPerPage)
            )
          );
          break;
        case "OLDEST":
          data = await getDocs(
            query(
              collection(db, "listings"),
              where("uid", "==", auth.currentUser.uid),
              orderBy("timestamp", "asc"),
              startAfter(lastFetchedListing),
              limit(listingsPerPage)
            )
          );
          break;
        case "LOW_TO_HIGH":
          data = await getDocs(
            query(
              collection(db, "listings"),
              where("uid", "==", auth.currentUser.uid),
              orderBy("price", "asc"),
              startAfter(lastFetchedListing),
              limit(listingsPerPage)
            )
          );
          break;
        case "HIGH_TO_LOW":
          data = await getDocs(
            query(
              collection(db, "listings"),
              where("uid", "==", auth.currentUser.uid),
              orderBy("price", "desc"),
              startAfter(lastFetchedListing),
              limit(listingsPerPage)
            )
          );
          break;
        case "bedrooms":
        case "bathrooms":
        case "cars":
          console.log("bedrooms, bathrooms, cars");
          data = await getDocs(
            query(
              collection(db, "listings"),
              where("uid", "==", auth.currentUser.uid),
              where(searchFilterBy, "==", +searchNumber),
              startAfter(lastFetchedListing),
              limit(listingsPerPage)
            )
          );
          break;
      }
      let lastFetched = data.docs[data.docs.length - 1];
      if (data.docs.length < listingsPerPage) {
        setNoMoreListings(true);
      }
      setLastFetchedListing(lastFetched);
      let newListings = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setListings([...listings, ...newListings]);
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Could not get listings.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter !== "bedrooms" && filter !== "bathrooms" && filter !== "cars") {
      setSearchFilterBy("disabled");
    }
    getListings();
  }, [filter, filterNumber]);

  useEffect(() => {
    if (searchFilterBy === "disabled") {
      return;
    }
    prevSearchFilterBy.current = searchFilterBy;
    if (prevSearchFilterBy.current) {
      setFilter(searchFilterBy);
      setFilterNumber(searchNumber)
    }
  }, [searchFilterBy, searchNumber]);

  const filterListings = async (e) => {
    setFilter(e.target.value);
  };

  const toggleModal = () => {
    document.body.classList.toggle("filter__open");
  };

  if (loading) {
    return <Spinner />;
  }

  const filterByRooms = async () => {
    toggleModal();
    setSearchFilterBy(filterBy);
    setSearchNumber(number);
  };

  const resetFilter = () => {
    setFilter("NEWEST");
    setFilterBy("bedrooms");
    setNumber(1);
  };

  return (
    <>
      <Navbar />
      <div className="listings__container">
        <div className="listings">
          <div className="listings__header">
            <div className="listings__modal">
              <div className="listings__modal--label">Filter by:</div>
              <div className="listings__modal--buttons">
                <button
                  className={`listings__modal--button ${
                    filterBy === "bedrooms"
                      ? "listings__modal--button--active"
                      : ""
                  }`}
                  value="bedrooms"
                  onClick={(e) => {
                    setFilterBy(e.target.value);
                  }}
                >
                  Bedrooms
                </button>
                <button
                  className={`listings__modal--button ${
                    filterBy === "bathrooms"
                      ? "listings__modal--button--active"
                      : ""
                  }`}
                  value="bathrooms"
                  onClick={(e) => {
                    setFilterBy(e.target.value);
                  }}
                >
                  Bathrooms
                </button>
                <button
                  className={`listings__modal--button ${
                    filterBy === "cars" ? "listings__modal--button--active" : ""
                  }`}
                  value="cars"
                  onClick={(e) => {
                    setFilterBy(e.target.value);
                  }}
                >
                  Parking
                </button>
              </div>
              <div className="listings__modal--label">Number:</div>
              <input
                type="number"
                inputMode="numeric"
                className="listings__modal--number"
                value={number}
                onChange={(e) => {
                  setNumber(+e.target.value);
                }}
                min="0"
                max="50"
              />
              <div className="listings__modal--bottom">
                <button
                  onClick={() => {
                    toggleModal();
                    resetFilter();
                  }}
                  className="listings__modal--clear"
                >
                  Clear filters
                </button>
                <button
                  onClick={filterByRooms}
                  className="listings__modal--submit"
                >
                  Filter
                </button>
              </div>
            </div>
            <button onClick={toggleModal} className="listings__filter">
              <i className="fa-solid fa-filter"></i>
              Filter
            </button>
            <span className="sort">Sort</span>
            <select
              defaultValue={"NEWEST"}
              className="listings__select"
              onChange={filterListings}
            >
              <option value="NEWEST">Date (Newest - Oldest)</option>
              <option value="OLDEST">Date (Oldest - Newest)</option>
              <option value="LOW_TO_HIGH">Price (Lowest - Highest)</option>
              <option value="HIGH_TO_LOW">Price (Highest - Lowest)</option>
            </select>
          </div>
          {listings?.map((listing) => {
            return <Thumbnail owner key={listing.id} listing={listing} />;
          })}
          {!noMoreListings && (
            <button onClick={getMoreListings} className="listings__load">
              Load More
            </button>
          )}
        </div>
      </div>
    </>
  );
}
export default MyListings;
