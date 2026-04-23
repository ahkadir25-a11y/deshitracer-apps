import { requireMemberAuth } from '../../members/memberAuth';

const router = Router();

router.get('/', VisitorCountControllers.getAdminAnalytics);

router.get('/me/history', requireMemberAuth, VisitorCountControllers.getMemberVisitHistory);

router.get('/:businessId/contact', ContactCountControllers.getContactAnalytics);

router.post('/:businessId', ContactCountControllers.addContactCount);

router.get('/:businessId', VisitorCountControllers.getBusinessAnalytics);

router.post('/:businessId/visit', VisitorCountControllers.addToVisitorCount);


export const VisitorCountRoutes = router;
