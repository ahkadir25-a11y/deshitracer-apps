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

router.put(
  '/:reviewId',

  ReviewControllers.updateReviewByReviewer,
);
export const ReviewRoutes = router;
