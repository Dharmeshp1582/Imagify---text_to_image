import express from "express"
import { loginUser, paymentRazorpay, registerUser, userCredits, verifyPayment } from "../controllers/user.controller.js"
import { userAuth } from "../middlewares/auth.middleware.js"
const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.get("/credits", userAuth,userCredits)
// userRouter.get("/logout", userAuth, logoutUser);
userRouter.post("/pay-razor", userAuth, paymentRazorpay);
userRouter.post("/verify-razor", userAuth, verifyPayment);

export default userRouter