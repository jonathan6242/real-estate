import "./Spinner.css"

function Spinner({ status }) {
  return (
    <div className="spinner__container">
      <div className="spinner"></div>
      {
        status && (
          <p className="spinner__status">{status}</p> 
        )
      }
    </div>
  )
}
export default Spinner