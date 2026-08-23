import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { ReviewControllers } from './review.controller';

const router = Router();

// Create a new review
router.post('/create', ReviewControllers.createReview);

// Get all reviews of a business
router.get('/all/:businessId', ReviewControllers.getAllBusinessReviews);

// Get all reviews
router.get('/', ReviewControllers.getAllReviews);

// Get a single review by ID
router.get('/:reviewId', ReviewControllers.getSingleReview);

// Update review visibility
router.put(
  '/:reviewId/visibility',
  auth(USER_ROLE.ADMIN), // Only admins can update review visibility
  ReviewControllers.updateReviewVisibility,
);

// Editing a review's rating and text.
//
// This route carried no auth middleware at all, so anyone on the internet who
// knew a review id could rewrite its stars and its wording — turning a
// restaurant's five-star reviews into one-star ones without logging in.
//
// Admin-only, matching the visibility route above. It cannot be scoped to the
// reviewer instead, because a review records only an email and the `user`
// field on the model is commented out, so there is nobody to check the caller
// against. Nothing in the app calls this endpoint (it only creates reviews and
// lists them), so requiring admin breaks no existing screen.
router.put(
  '/:reviewId',
  auth(USER_ROLE.ADMIN),
  ReviewControllers.updateReviewByReviewer,
);
export const ReviewRoutes = router;
