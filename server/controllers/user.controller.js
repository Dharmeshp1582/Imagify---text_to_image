import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay"
import transactionModel from "../models/transaction.model.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing details" });
    }

    const salt = await bcrypt.genSalt(10); //for hashing password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

     // 🔥 Save token in cookie
    res.cookie("token", token, {
      httpOnly: true,       // can't access cookie in JS
      secure: process.env.NODE_ENV === "production", // https only in production
      sameSite: "strict",   // protect against CSRF
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      newUser: {
        name: newUser.name,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing details" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // bcrypt.compare() returns true if the password matches the hashed password
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "3d",
      });

       //  Save token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

      return res.status(200).json({
        success: true,
        message: "Welcome back " + user.name,
        token,
        user: {
          name: user.name,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const userCredits = async (req, res) => {
  try {
    const userId = req.userId; 

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      credits: user.creditBalance,
      user: { name: user.name },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// export const logoutUser = async (req, res) => {
//   try {
//     // Clear the cookie
//     res.clearCookie("token");
//     return res.status(200).json({ success: true, message: "Logged out successfully" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };


 const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const paymentRazorpay = async (req, res) => {
try {
  
  const { planId} = req.body;
  const userId = req.userId;

  const userData = await userModel.findById(userId);

  if(!userId || !planId) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  let credits,plan, amount, date ;

  switch (planId) {
    case 'Basic':
      plan = 'Basic';
      credits = 100;
      amount = 10;
      break;
    
     case 'Advanced':
      plan = 'Advanced';
      credits = 500;
      amount = 50;
      break;

     case 'Business':
      plan = 'Business';
      credits = 5000;
      amount = 250;
      break;
  
    default:
      return res.json({ success: false, message: "Invalid plan" });
  }

  date = Date.now();

  const transactionData = {
    userId, plan , amount, credits, date
  }

  const newTransaction = await transactionModel.create(transactionData);

  const options = {
    amount: amount * 100, // amount in rupees 
    currency: process.env.CURRENCY,
    receipt: newTransaction._id,
    
  }

  await razorpayInstance.orders.create(options,(error,order) => {
     if(error){
       console.log(error);
       return res.status(500).json({ success: false, message: "Payment failed" });
     }
     return res.status(200).json({ success: true, order, credits, plan, amount });
  })

} catch (error) {
   console.log(error)
   return res.status(500).json({ success: false, message: "Server error" });
}
}


export const verifyPayment = async (req, res) => { 
 try {
  
  const {razorpay_order_id} = req.body 

  const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

  if(orderInfo.status === 'paid') {
   const transactionData = await transactionModel.findById(orderInfo.receipt); 
   if(transactionData.payment) {
     return res.status(401).json({ success: false, message: "Payment failed" });
   }

   const userData = await userModel.findById(transactionData.userId)

   const creditBalance = userData.creditBalance + transactionData.credits;

   await userModel.findByIdAndUpdate(userData._id, {creditBalance}, {new: true});

   await transactionModel.findByIdAndUpdate(transactionData._id, { payment: true }, { new: true });

   return res.status(201).json({ success: true, message: "Credits Added Successfully" });
  }else{
    return res.status(201).json({ success: false, message: "Payment Failed" });
  }
 } catch (error) {
  console.log(error);
 }

}