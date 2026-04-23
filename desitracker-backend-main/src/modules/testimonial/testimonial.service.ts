import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../utils/queryBuilder';
import { TTestimonial } from './testimonial.interface';
import Testimonial from './testimonial.model';

const createTestimonial = async (
  payload: TTestimonial,
  decodedUser: JwtPayload,
) => {
  return await Testimonial.create({ ...payload, user: decodedUser?.id });
};

const getAllTestimonials = async (query: any) => {
  const testimonialQuery = new QueryBuilder<TTestimonial>(
    Testimonial.find().populate([
      {
        path: 'user',
        model: 'User',
      },
    ]),
    query,
  )
    .search(['name', 'feedback']) // Enable search by name & feedback
    .filter()
    .sort()
    .paginate()
    .fieldsLimit();

  const testimonials = await testimonialQuery.modelQuery;

  const meta = await testimonialQuery.countTotal();

  return { testimonials, meta };
};

const getSingleTestimonial = async (testimonialId: string) => {
  const testimonial = await Testimonial.findById(testimonialId)
    .populate('user')
    .exec();

  if (!testimonial) {
    throw new AppError(404, 'Testimonial not found!');
  }

  return testimonial;
};

const updateTestimonialVisibility = async (
  testimonialId: string,
  show: boolean,
) => {
  const updatedTestimonial = await Testimonial.findByIdAndUpdate(
    testimonialId,
    { show: show },
    { new: true, runValidators: true },
  );

  if (!updatedTestimonial) {
    throw new AppError(404, 'Testimonial not found!');
  }

  return updatedTestimonial;
};

const updateTestimonialByProvider = async (
  testimonialId: string,
  payload: Partial<TTestimonial>,
  decodedUser: JwtPayload,
) => {
  const testimonial = await Testimonial.findById(testimonialId);

  if (!testimonial) {
    throw new AppError(404, 'Testimonial is not found.');
  }

  if (testimonial.user.toString() !== decodedUser.id.toString()) {
    throw new AppError(403, 'You are not authorized to edit this testimonial.');
  }

  const { user, show, ...remaining } = payload;

  const updatedTestimonialData: Partial<TTestimonial> = {
    rating: payload?.rating ? payload?.rating : testimonial?.rating,
    feedback: payload?.feedback ? payload?.feedback : testimonial?.feedback,
  };

  const updatedTestimonial = await Testimonial.findByIdAndUpdate(
    testimonialId,
    updatedTestimonialData,
    { new: true, runValidators: true },
  );

  if (!updatedTestimonial) {
    throw new AppError(404, 'Testimonial not found!');
  }

  return updatedTestimonial;
};

export const TestimonialServices = {
  createTestimonial,
  getAllTestimonials,
  getSingleTestimonial,
  updateTestimonialVisibility,
  updateTestimonialByProvider,
};
