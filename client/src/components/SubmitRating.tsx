import { Star } from "lucide-react"; // Import a star icon for rating
import { useState } from "react";

interface RatingProps {
  rating: number;
  onRatingChange?: (newRating: number) => void; // Optional callback for rating change
}

function SubmitRating({ rating, onRatingChange }: RatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null); // For hover effect

  // Render stars based on the rating or hover state
  const renderStars = (filled: boolean, index: number) => (
    <Star
      key={index}
      size={24}
      className={`cursor-pointer transition-colors ${
        filled ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
      }`}
      onMouseEnter={() => setHoverRating(index + 1)} // Hover effect
      onMouseLeave={() => setHoverRating(null)} // Reset hover state
      onClick={() => onRatingChange && onRatingChange(index + 1)} // Set rating on click
    />
  );

  // Determine which stars should be filled
  const displayRating = hoverRating ?? rating; // Use hoverRating if available
  const filledStars = Math.floor(displayRating); // Number of filled stars

  return (
    <div className="flex items-center gap-1">
      {/* Generate filled and unfilled stars */}
      {[...Array(5)].map((_, index) => renderStars(index < filledStars, index))}
    </div>
  );
}

export default SubmitRating;
