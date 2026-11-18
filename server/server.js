import express, { application, json }  from 'express'
import dotenv from 'dotenv'
import { connectDb } from './config/db.js'
import router from './routes/userRoutes.js'
import router2 from './routes/videoRoute.js'
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

app.use(errorHandler)


app.listen(PORT,"0.0.0.0", () => {
    console.log(`server running on port ${PORT}`);
})