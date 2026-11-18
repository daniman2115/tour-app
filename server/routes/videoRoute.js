import express from 'express'
import { getStreamToken, syncUserToStream } from '../controllers/videoController.js'

const router = express.Router()


router.post('/token', getStreamToken)
router.post('/sync-user', syncUserToStream)



export default router