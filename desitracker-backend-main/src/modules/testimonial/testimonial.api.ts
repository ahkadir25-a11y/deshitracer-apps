import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { TestimonialControllers } from './testimonial.controller';

const router = Router();

// Create a new testimonial
router.post(
  '/create',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  TestimonialControllers.createTestimonial,
);

// Get all testimonials
router.get('/', TestimonialControllers.getAllTestimonials);

// Get a single testimonial by ID
router.get('/:testimonialId', TestimonialControllers.getSingleTestimonial);

// Update testimonial visibility
router.put(
  '/:testimonialId/visibility',
  auth(USER_ROLE.ADMIN), // Only admins can update testimonial visibility
  TestimonialControllers.updateTestimonialVisibility,
);

router.put(
  '/:testimonialId',
  auth(USER_ROLE.USER), // Only admins can update testimonial visibility
  TestimonialControllers.updateTestimonialByProvider,
);
export const TestimonialRoutes = router;
