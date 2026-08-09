import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google-login', AuthController.googleLogin);
router.get('/me', authenticate, AuthController.getMe);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/reset-password-otp', AuthController.resetPasswordWithOTP);
router.post('/reset-password', AuthController.resetPassword);
router.get('/google', AuthController.googleAuth);

export default router;
