import React, { useContext } from "react";
import { assets, plans } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { motion } from "motion/react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BuyCredit = () => {
  const { user, backendUrl, loadCreditsData, token, setShowLogin } =
    useContext(AppContext);

    const navigate = useNavigate();

  const initPay = (order) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: "INR",
    name: "Imagify - Payment",
    description: "Purchase Credits",
    image: assets.logo_icon,
    order_id: order.id,
    handler: async (response) => {
      console.log("Razorpay payment response:", response); // 🔹 log razorpay response
      try {
        const verifyResponse = await axios.post(
          backendUrl + "/api/user/verify-razor",
          response,
          {
            headers: { Authorization: `Bearer ${token}` },
          }, { withCredentials: true }
        );
        console.log("Backend verification response:", verifyResponse.data); // 🔹 log backend response

       if(verifyResponse.data.success){
         loadCreditsData(); // refresh credits
         navigate('/'); // redirect to home
         toast.success("Credits Added!");
       }
      } catch (err) {
        console.error("Verification error:", err.response?.data || err.message);
        toast.error("Payment verification failed.");
      }
    },
    theme: { color: "#2563eb" },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};


  // Payment request
  const paymentRazorpay = async (planId) => {
    try {
      if (!user) {
        setShowLogin(true);
        return;
      }

      const { data } = await axios.post(
        backendUrl + "/api/user/pay-razor",
        { planId }, // only planId
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      if (data.success) {
        initPay(data.order);
      } else {
        toast.error(data.message || "Payment failed. Try again.");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="min-h-[80vh] text-center pt-14 mb-10"
    >
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">
        Our Plans
      </button>
      <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10">
        Choose the plan
      </h1>

      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((item, index) => (
          <div
            key={index}
            className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500"
          >
            <img src={assets.logo_icon} alt="" width={40} />
            <p className="mt-3 mb-1 font-semibold">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">${item.price}</span> /{" "}
              {item.credits} credits
            </p>

            <motion.button
              onClick={() => paymentRazorpay(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                default: { duration: 0.5 },
                opacity: { delay: 0.8, duration: 1 },
              }}
              className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52 cursor-pointer"
            >
              {user ? "Purchase" : "Get Started"}
            </motion.button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BuyCredit;
