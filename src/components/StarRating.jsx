export default function StarRating({ rating, reviewsCount, size = "sm" }) {
  return (
    <div className={`star-rating star-rating-${size}`}>
      <span className="rating-num">{rating.toFixed(1)}/5</span>
      {reviewsCount != null && <span className="rating-count">({reviewsCount} reviews)</span>}
    </div>
  );
}
