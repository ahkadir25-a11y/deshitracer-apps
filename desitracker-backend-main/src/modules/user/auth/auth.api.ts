import { Router } from 'express';
import { AuthControllers } from './auth.controllers';

const router = Router();

router.post('/login', AuthControllers.loginUser);

router.post('/logout', AuthControllers.logoutUser);

router.post('/forgot-password', AuthControllers.forgotPassword);

router.post('/reset-password/:token', AuthControllers.resetPassword);

export const AuthRoutes = router;
