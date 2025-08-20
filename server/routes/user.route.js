import express from "express"
import { loginUser, registerUser, userCredits } from "../controllers/user.controller.js"
import { userAuth } from "../middlewares/auth.middleware.js"
const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/credits", userAuth,userCredits)


export default userRouter