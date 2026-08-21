import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, MessageSquare, AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { getListingReviews, createReview } from "../services/reviews";
import { useAuth } from "../contexts/AuthContext";
import PrimaryButton from "./PrimaryButton";

interface ListingReviewsSectionProps {
  listingId: string;
}

export const ListingReviewsSection: React.FC<ListingReviewsSectionProps> = ({
  listingId,
}) => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // ── Live Query: GET /api/reviews/:listingId ───────────────────────────────
  const {
    data: reviewsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["listing-reviews", listingId],
    queryFn: () => getListingReviews(listingId),
    enabled: Boolean(listingId),
  });

  const summary = reviewsData?.summary || { averageRating: 0, totalReviews: 0 };
  const reviews = reviewsData?.reviews || [];

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setSubmitError("Please provide a short comment with your review.");
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    try {
      await createReview(listingId, {
        rating,
        comment: comment.trim(),
      });

      queryClient.invalidateQueries({ queryKey: ["listing-reviews", listingId] });
      setSubmitSuccess("Review submitted successfully!");
      setComment("");
      setShowReviewForm(false);
      setTimeout(() => setSubmitSuccess(null), 4000);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setSubmitError("You have already reviewed this listing.");
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to submit review.";
        setSubmitError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 pt-3 border-t border-neutral-100">
      {/* Header / Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#1C1B1B]">
            Customer Reviews
          </span>
          <div className="flex items-center gap-1 bg-[#FFF8E6] px-2 py-0.5 rounded-md text-[11px] font-bold text-[#8A6200]">
            <Star className="w-3 h-3 fill-[#FFC72C] text-[#FFC72C]" />
            <span>
              {summary.averageRating > 0
                ? summary.averageRating.toFixed(1)
                : "New"}
            </span>
            <span className="text-neutral-400 font-normal">
              ({summary.totalReviews})
            </span>
          </div>
        </div>

        {session?.token && !showReviewForm && (
          <button
            type="button"
            onClick={() => setShowReviewForm(true)}
            className="text-xs font-bold text-[#005047] hover:underline cursor-pointer flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Write a review</span>
          </button>
        )}
      </div>

      {submitSuccess && (
        <div className="bg-[#E6FAF6] text-[#005047] text-xs font-semibold p-3 rounded-xl flex items-center gap-2 border border-[#005047]/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{submitSuccess}</span>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-[#F9F8F6] p-4 rounded-2xl border border-neutral-200/80 flex flex-col gap-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1C1B1B]">
              Your Rating & Feedback
            </span>
            {/* Star Selector */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-0.5 cursor-pointer focus:outline-none"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      star <= (hoverRating ?? rating)
                        ? "fill-[#FFC72C] text-[#FFC72C]"
                        : "text-neutral-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {submitError && (
            <div className="bg-[#FCE8E6] text-[#BA1A1A] text-xs font-semibold p-2.5 rounded-xl flex items-center gap-2 border border-[#BA1A1A]/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this vendor (e.g. food quality, pricing, promptness)..."
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white focus:border-[#005047] focus:ring-1 focus:ring-[#005047] outline-none resize-none text-[#1C1B1B]"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false);
                setSubmitError(null);
              }}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs text-[#747878] hover:text-[#1C1B1B] font-medium transition-colors"
            >
              Cancel
            </button>
            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              className="py-1.5 px-4 text-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <Send className="w-3 h-3" />
                  <span>Submit</span>
                </div>
              )}
            </PrimaryButton>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-neutral-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#005047]" />
          <span className="text-xs">Loading reviews...</span>
        </div>
      ) : isError ? (
        <span className="text-[11px] text-[#BA1A1A]">
          Unable to load reviews for this listing.
        </span>
      ) : reviews.length === 0 ? (
        <div className="text-center py-4 text-xs text-neutral-400">
          No reviews yet. Be the first to share your experience!
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
          {reviews.map((rev) => {
            const reviewerName =
              typeof rev.userId === "object" && rev.userId !== null
                ? rev.userId.fullName
                : "Verified Commuter";

            return (
              <div
                key={rev._id}
                className="p-3 rounded-xl bg-[#F9F8F6] border border-black/5 flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1C1B1B]">
                    {reviewerName}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= rev.rating
                            ? "fill-[#FFC72C] text-[#FFC72C]"
                            : "text-neutral-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[#444748] text-[11px] m-0 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ListingReviewsSection;
