import axios from "axios";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { auth, db, storage } from "../firebase";
import useAuthStatus from "../hooks/useAuthStatus";
import "./CreateListing.css";
import { v4 as uuidv4 } from "uuid"
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

function EditListing() {
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [fields, setFields] = useState({
    type: "buy",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    cars: 1,
    title: "",
    description: "",
    agent: "",
    agentEmail: "",
    address: "",
    property: "",
    sqm: 1,
    agentPhoto: null,
    houseImages: [],
    price: 0
  });
  const { loggedIn, loading } = useAuthStatus();
  const [submitting, setSubmitting] = useState(false)
  const [submittingStatus, setSubmittingStatus] = useState('');
  const navigate = useNavigate();
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    cars,
    title,
    description,
    agent,
    agentEmail,
    address,
    property,
    sqm,
    agentPhoto,
    houseImages,
    price
  } = fields;

  useEffect(() => {
    setSubmitting(true);
    setSubmittingStatus(null);
    const getListing = async () => {
      const docSnap = await getDoc(
        doc(db, "listings", params.id)
      )
      if(docSnap.exists()) {
        console.log('test')
        if(docSnap.data().uid !== auth.currentUser.uid) {
          toast.error('You can not edit someone else\'s listing.')
          setSubmitting(false);
          navigate('/')
          return;
        }
        setListing(docSnap.data())
        const listingCopy = {...docSnap.data()}
        delete listingCopy.agentImg;
        delete listingCopy.imgUrls
        setFields({
          ...listingCopy, 
          address: listingCopy.location,
          agentPhoto: null,
          houseImages: []
        })
        setSubmitting(false);
      } else {
        toast.error('Listing does not exist');
        navigate('/')
        setSubmitting(false);
      }
    }
    getListing();
  }, [])

  useEffect(() => {
    if (!loading) {
      if (!loggedIn) {
        navigate("/signin");
        toast.error("Must be signed in to edit listing.");
      } else {
        setFields({ ...fields, uid: auth.currentUser.uid });
      }
    }
  }, [loading]);

  const onChange = (e) => {
    // Files
    if(e.target.files) {
      if(e.target.id === 'houseImages') {
        setFields({
          ...fields,
          houseImages: e.target.files
        })
      }
      if(e.target.id === 'agentPhoto') {
        setFields({
          ...fields,
          agentPhoto: e.target.files
        })
      }
      return;
    }
    if (e.target.type === "number") {
      setFields({
        ...fields,
        [e.target.id]: +e.target.value,
      });
      return;
    }
    setFields({
      ...fields,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmittingStatus('Geocoding address...')

    if(agentPhoto.length > 6) {
      toast.error('Cannot upload more than 6 images.')
      return;
    }

    let geolocation = {};

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_API_KEY}`
      );
      const data = response.data.results[0]
      if(!data) {
        toast.error('Invalid address');
      }
      geolocation = data.geometry.location
    } catch (error) {
      setSubmitting(false);
      toast.error('Invalid address');
      console.log(error)
      return;
    }

    // Store images
    const storeImage = async (image, agent) => {
      return new Promise((resolve, reject) => {
        const fileName = `${image.name}-${uuidv4()}`
        let storageRef;
        if(!agent) {
          storageRef = ref(storage, `images/${fileName}`)
        } else {
          storageRef = ref(storage, `agents/${fileName}`)
        }
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          }, 
          (error) => {
            reject(error)
          }, 
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
            });
          }
        );
      })
    }

    setSubmittingStatus('Uploading images...')

    let agentImg;
    let imgUrls;

    try {
      const agentPhotoCopy = agentPhoto;
      agentImg = await storeImage(agentPhotoCopy[0], true)
      imgUrls = await Promise.all([...houseImages].map(image => storeImage(image, false)))
    } catch (error) {
      setSubmitting(false);
      console.log(error)
      toast.error('Could not upload images.');
      return;
    }

    const fieldsCopy = {
      ...fields,
      location: address,
      geolocation,
      agentImg,
      imgUrls,
      timestamp: serverTimestamp()
    }
    delete fieldsCopy.agentPhoto
    delete fieldsCopy.houseImages
    delete fieldsCopy.address

    setSubmittingStatus('Updating listing in database...')
    await updateDoc(doc(db, "listings", params.id), fieldsCopy)

    setSubmitting(false);
    toast.success('Listing updated');
    navigate(`/listings/${params.id}`)
  };

  if (loading || submitting) {
    return <Spinner status={submittingStatus}/>;
  }

  return (
    <>
      <Navbar />
      <div className="create__container">
        <div className="create__row">
          <h1 className="create__title">Edit Listing</h1>
          <form onSubmit={onSubmit} className="create__form">
            <div className="input-group">
              <label className="input-group__label">Sell / Rent</label>
              <div className="input-group__buttons">
                <button
                  type="button"
                  value="buy"
                  id="type"
                  onClick={onChange}
                  className={`input-group__button${
                    type === "buy" ? " input-group__button--active" : ""
                  }`}
                >
                  Sell
                </button>
                <button
                  type="button"
                  value="rent"
                  id="type"
                  onClick={onChange}
                  className={`input-group__button${
                    type === "rent" ? " input-group__button--active" : ""
                  }`}
                >
                  Rent
                </button>
              </div>
            </div>
            <div className="input-group">
              <label className="input-group__label">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={onChange}
                className="input-group__text"
              />
            </div>
            <div className="input-group input-group__numbers">
              <div className="input-group__number">
                <div className="input-group__label">Price</div>
                <input
                  type="number"
                  className="input-group__number--input price"
                  id="price"
                  value={price}
                  onChange={onChange}
                  min={0}
                  max={100000000}
                  required
                />
              </div>
            </div>
            <div className="input-group input-group__numbers">
              <div className="input-group__number">
                <div className="input-group__label">Bedrooms</div>
                <input
                  type="number"
                  className="input-group__number--input"
                  id="bedrooms"
                  value={bedrooms}
                  onChange={onChange}
                  min={1}
                  max={50}
                  required
                />
              </div>
              <div className="input-group__number">
                <div className="input-group__label">Bathrooms</div>
                <input
                  type="number"
                  className="input-group__number--input"
                  id="bathrooms"
                  value={bathrooms}
                  onChange={onChange}
                  min={1}
                  max={50}
                  required
                />
              </div>
              <div className="input-group__number">
                <div className="input-group__label">Parking</div>
                <input
                  type="number"
                  className="input-group__number--input"
                  id="cars"
                  value={cars}
                  onChange={onChange}
                  min={1}
                  max={50}
                  required
                />
              </div>
            </div>
            <div className="input-group input-group__numbers">
              <div className="input-group__number">
                <div className="input-group__label">Land Size (sqm)</div>
                <input
                  type="number"
                  className="input-group__number--input land-size"
                  id="sqm"
                  value={sqm}
                  onChange={onChange}
                  min={1}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label className="input-group__label">Address</label>
              <textarea
                type="text"
                id="address"
                value={address}
                onChange={onChange}
                className="input-group__text"
              ></textarea>
            </div>
            <div className="input-group">
              <label className="input-group__label">Property Type</label>
              <input
                type="text"
                id="property"
                value={property}
                onChange={onChange}
                className="input-group__text"
              />
            </div>
            <div className="input-group">
              <label className="input-group__label">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={onChange}
                className="input-group__text"
              />
            </div>
            <div className="input-group">
              <label className="input-group__label">Description</label>
              <textarea
                type="text"
                id="description"
                value={description}
                onChange={onChange}
                className="input-group__text"
              ></textarea>
            </div>
            <div className="input-group">
              <label className="input-group__label">Agent Name</label>
              <input
                type="text"
                id="agent"
                value={agent}
                onChange={onChange}
                className="input-group__text"
              />
            </div>
            <div className="input-group">
              <label className="input-group__label">Agent Email</label>
              <input
                type="text"
                id="agentEmail"
                value={agentEmail}
                onChange={onChange}
                className="input-group__text"
              />
            </div>
            <div className="input-group">
              <label className="input-group__label">Agent Photo</label>
              <input
                type="file"
                id="agentPhoto"
                onChange={onChange}
                className="input-group__file"
                accept='.jpg,.png,.jpeg'
                required
              />
            </div>
            <div className="input-group">
              <label className="input-group__label">Property Images (6 maximum)</label>
              <input
                type="file"
                multiple="multiple"
                max='6'
                accept='.jpg,.png,.jpeg'
                id="houseImages"
                onChange={onChange}
                className="input-group__file"
                required
              />
            </div>
            <button type="submit" className="create__form--submit">
              Update Listing
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
export default EditListing;
