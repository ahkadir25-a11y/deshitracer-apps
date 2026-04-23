import config from '../../config';
import AppError from '../../errors/AppError';
import sendEmail from '../../utils/lib/sendEmail';
import QueryBuilder from '../../utils/queryBuilder';
import { Business } from '../business/business.model';
import { TReview } from './review.interface';
import Review from './review.model';

const createReview = async (payload: TReview) => {
  const business = await Business.findById(payload?.business);
  if (!business) {
    throw new AppError(404, 'Business not found!');
  }

  const existingReview = await Review.findOne({
    business: payload.business,
    email: payload.email,
  });
  if (existingReview) {
    throw new AppError(400, 'You have already submitted a review for this business');
  }

  if (!payload?.name || !payload?.email || !payload?.rating) {
    throw new AppError(400, 'Name, email, and rating are required');
  }

  const acceptedEmailDomains = [
    'protonmail.com', 'tutanota.com', 'fastmail.com', 'hushmail.com', 'hey.com',
    'gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'zoho.com', 'gmx.com',
    'mail.com', 'aol.com', 'yandex.com', 'inbox.com'
  ];
  const emailDomain = payload?.email?.split('@')[1];
  if (!acceptedEmailDomains.includes(emailDomain)) {
    throw new AppError(400, 'Email provider not accepted');
  }

  const review = await Review.create({ ...payload });
  if (!review) {
    throw new AppError(500, 'Failed to submit review.');
  }

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>Review Submission Confirmation</title></head>
    <body>
      <h1>Thank you for submitting your review!</h1>
      <p>Dear ${review?.name},</p>
      <p>Thank you for sharing your thoughts. We have received your review for <strong>${business?.businessName}</strong>.</p>
      <p>Your feedback is valuable, and we appreciate your time.</p>
      <p>Best regards,<br/>The Review Team</p>
    </body>
    </html>
  `;

  // 🔥 Using the same sendEmail helper
  sendEmail({
    email: payload.email,
    subject: `Review Submitted Successfully For ${business.businessName}`,
    message: htmlTemplate,
  });

  return review;
};

const getAllBusinessReviews = async (businessId: string, query: any) => {
  const reviewQuery = new QueryBuilder<TReview>(
    Review.find({ business: businessId }).populate([
      {
        path: 'business',
        model: 'Business',
      },
    ]),
    query,
  )
    .search(['name', 'email']) // Enable search by name & feedback
    .filter()
    .sort()
    .paginate()
    .fieldsLimit();

  const reviews = await reviewQuery.modelQuery;

  const meta = await reviewQuery.countTotal();

  return { reviews, meta };
};

const getAllReviews = async (query: any) => {
  const reviewQuery = new QueryBuilder<TReview>(
    Review.find().populate([
      {
        path: 'business',
        model: 'Business',
      },
    ]),
    query,
  )
    .search(['name', 'email']) // Enable search by name & feedback
    .filter()
    .sort()
    .paginate()
    .fieldsLimit();

  const reviews = await reviewQuery.modelQuery;

  const meta = await reviewQuery.countTotal();

  return { reviews, meta };
};

const getSingleReview = async (reviewId: string) => {
  const review = await Review.findById(reviewId)
    .populate('business', 'user')
    .exec();

  if (!review) {
    throw new AppError(404, 'Review not found!');
  }

  return review;
};

const updateReviewVisibility = async (reviewId: string, show: boolean) => {
  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { show: show },
    { new: true, runValidators: true },
  );

  if (!updatedReview) {
    throw new AppError(404, 'Review not found!');
  }

  return updatedReview;
};

const updateReviewByReviewer = async (
  reviewId: string,
  payload: Partial<TReview>,
) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError(404, 'Review is not found.');
  }

  const { business, show, ...remaining } = payload;

  const updatedReviewData: Partial<TReview> = {
    rating: payload?.rating ? payload?.rating : review?.rating,
    feedback: payload?.feedback ? payload?.feedback : review?.feedback,
  };

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    updatedReviewData,
    { new: true, runValidators: true },
  );

  if (!updatedReview) {
    throw new AppError(404, 'Review not found!');
  }

  return updatedReview;
};

export const ReviewServices = {
  createReview,
  getAllBusinessReviews,
  getAllReviews,
  getSingleReview,
  updateReviewVisibility,
  updateReviewByReviewer,
};
