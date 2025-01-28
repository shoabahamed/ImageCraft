import { Star } from "lucide-react"; // Import a star icon for rating

interface RatingProps {
  rating: number;
  onRatingChange?: (newRating: number) => void;
}

function Rating({ rating }: RatingProps) {
  const filledStars = Math.floor(rating); // Full stars
  const emptyStars = 5 - filledStars; // Empty stars

  return (
    <div className="flex items-center gap-1 text-yellow-400">
      {[...Array(filledStars)].map((_, i) => (
        <Star key={i} size={18} className="fill-current" />
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={i + filledStars} size={18} className="stroke-current" />
      ))}
      {/* <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span> */}
    </div>
  );
}

export default Rating;
