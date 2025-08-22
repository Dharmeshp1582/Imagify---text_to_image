import express from 'express'
import cors from 'cors'
import 'dotenv/config' 
import connectDb from './config/db.js';
import userRouter from './routes/user.route.js';
import cookieParser from 'cookie-parser';
import imageRouter from './routes/image.route.js';

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json());
app.use(cors(
  {
    origin: ['http://localhost:5173', 'https://imagify-text-to-image-mauve.vercel.app'],
    credentials: true,
  }
));
app.use(cookieParser());
connectDb();


//localhost:4000/api/user/register
//localhost:4000/api/user/login
app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
