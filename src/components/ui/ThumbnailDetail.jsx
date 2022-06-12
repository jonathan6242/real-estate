import "../Thumbnail.css";

function ThumbnailDetail({icon, number}) {
  return (
    <div className="thumbnail__detail">
      {icon}
      <span className="thumbnail__detail--number">
        {number}
      </span>
    </div>
  );
}
export default ThumbnailDetail;
