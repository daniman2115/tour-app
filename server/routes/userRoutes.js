import express from 'express'
import { googleLogin, login, register,  resetPassword,  sendVerificationResetCode,  updateProfile,  verifyCode, verifyResetCode } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js';
import { createUpload } from '../utils/multerHelper.js';


const router = express.Router()

export const uploadAdImages = createUpload(undefined, {
    limits: { fileSize: 15 * 1024 * 1024 },
    allowedTypes: ["image/jpeg", "image/png", "image/jpg", "image/webp"]
});

router.post('/register', register)
router.post('/verify-code', verifyCode);
router.post('/verify-reset-code', verifyResetCode);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/send-code', sendVerificationResetCode);
router.put('/reset-password', resetPassword);
router.put('/edit-profile', protect,uploadAdImages.single("profileImage"),updateProfile);



export default router