import { Router } from 'express';
import { AuthControllers } from './auth.controllers';

const router = Router();

router.post('/login', AuthControllers.loginUser);

router.post('/logout', AuthControllers.logoutUser);

router.post('/forgot-password', AuthControllers.forgotPassword);

router.post('/reset-password/:token', AuthControllers.resetPassword);

// In-app code (OTP) reset — no web link
router.post('/forgot-password-code', AuthControllers.requestResetCode);

router.post('/reset-password-code', AuthControllers.resetPasswordWithCode);

export const AuthRoutes = router;
