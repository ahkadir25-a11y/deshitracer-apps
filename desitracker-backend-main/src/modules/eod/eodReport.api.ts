import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { EODControllers } from './eodReport.controller';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.USER, USER_ROLE.STAFF),
  EODControllers.submitEODReport
);

router.get(
  '/business/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.USER, USER_ROLE.STAFF),
  EODControllers.getEODReportsByBusiness
);

export const EODRoutes = router;
