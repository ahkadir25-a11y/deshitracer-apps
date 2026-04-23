import { NextFunction, Request, Response, Router } from 'express';
import auth from '../../../middlewares/auth';
import { upload } from '../../../utils/lib/sendImageToCloudinery';
import { USER_ROLE } from '../../user/auth/auth.constants';
import { SliderControllers } from './slider.controllers';

const router = Router();

router.post(
  '/create',
  auth(USER_ROLE.ADMIN),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  SliderControllers.createSlider,
);

router.get('/all', SliderControllers.getAllSliders);

router.delete(
  '/delete/:id',
  auth(USER_ROLE.ADMIN),
  SliderControllers.deleteSlider,
);

router.get('/:id', SliderControllers.getSingleSlider);

export const SliderRoutes = router;
