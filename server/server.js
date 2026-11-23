import express, { application, json }  from 'express'
import dotenv from 'dotenv'
import { connectDb } from './config/db.js'
import router from './routes/userRoutes.js'
import router2 from './routes/videoRoute.js'
import placeRoutes from './routes/placeRoutes.js'
import tourGuideRoutes from './routes/tourGuideRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import callLogRoutes from './routes/callLogRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import { errorHandler } from './middleware/errorMiddleware.js';
import cors from 'cors'

dotenv.config()

connectDb()

const app = express()
app.use(cors())

const PORT = 5000


app.use(json())
app.use(express.urlencoded({ extended: true }));





app.use('/api/users/', router)
app.use('/api/users/', router2)
app.use('/api/places', placeRoutes)
app.use('/api/guides', tourGuideRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/calls', callLogRoutes)
app.use('/api/reviews', reviewRoutes)

app.use(errorHandler)


app.listen(PORT,"0.0.0.0", () => {
    console.log(`server running on port ${PORT}`);
})