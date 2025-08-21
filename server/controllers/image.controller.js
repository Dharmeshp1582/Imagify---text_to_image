import FormData from "form-data";
import userModel from "../models/user.model.js";
import axios from "axios";

export const generateImage = async (req, res) => {
  try {
    const userId = req.userId; // Extracted from userAuth middleware
    const {  prompt } = req.body;

    const user = await userModel.findById(userId);
    if ( !prompt) {
      return res
        .status(404)
        .json({ success: false, message: " missing details" });
    }

    if (user.creditBalance === 0 || userModel.creditBalance < 0) {
      return res.status(403).json({
        success: false,
        message: "Insufficient credits",
        creditBalance: user.creditBalance,
      });
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("prompt", prompt);

    // External API call
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIP_DROP_API,
        },
        responseType: "arraybuffer",
      }
    );

    // Convert buffer to base64
    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage = `data:image/png;base64,${base64Image}`;
    console.log(resultImage);

    // Deduct credits & return updated balance
    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { creditBalance: user.creditBalance - 1 },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Image generated successfully",
      resultImage,
      creditBalance: updatedUser.creditBalance,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
