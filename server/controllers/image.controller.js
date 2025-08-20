import userModel from "../models/user.model.js";


export const generateImage = async (req, res) => {
  try {
    
  const {userId,prompt} = req.body;

  const user = await userModel.findById(userId);
  if (!user || !prompt) {
    return res
      .status(404)
      .json({ success: false, message: "User not found or missing prompt" });
  }

  if(user.creditBalance === 0 || user.creditBalance < 0) {
    return res
      .status(403)
      .json({ success: false, message: "Insufficient credits", creditBalance: user.creditBalance });
  }

  // Call to external API or service to generate image
  const image = await externalImageService.generateImage(prompt);

  return res.status(200).json({
    success: true,
    image,
  });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
