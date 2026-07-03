import { Router } from 'express';
import { ContactCountControllers } from '../contactCount/contactCount.controller';
import { VisitorCountControllers } from './visitorCount.controller';

const router = Router();

router.get('/', VisitorCountControllers.getAdminAnalytics);

router.get('/:businessId/contact', ContactCountControllers.getContactAnalytics);

router.post('/:businessId', ContactCountControllers.addContactCount);

router.get('/:businessId', VisitorCountControllers.getBusinessAnalytics);

router.post('/:businessId/visit', VisitorCountControllers.addToVisitorCount);


export const VisitorCountRoutes = router;
