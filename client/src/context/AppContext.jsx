import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [user,setUser] = useState(null);
  const [showLogin,setShowLogin] = useState(false);
  const [token,setToken] = useState(localStorage.getItem("token"));

const [credit,setCredit] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // console.log(backendUrl)

  const navigate = useNavigate();

  const loadCreditsData = async () => {
  try {
    const { data } = await axios.get(backendUrl + '/api/user/credits', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (data.success){ setCredit(data.credits);
      setUser(data.user);
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
  }


  const generateImage = async (prompt) => {  
   try {
     const { data } = await axios.post(backendUrl + '/api/image/generate-image', { prompt }, {
       headers: { Authorization: `Bearer ${token}` },
     });
     if (data.success) {
       // Handle successful image generation
       toast.success("Image generated successfully!");
       loadCreditsData();
       return data.resultImage;
     }else{
       toast.error(data.message);
       loadCreditsData();
       if(data.creditBalance === 0) {
         toast.error("Insufficient credits");
         navigate('/buy');
       }
     }
   } catch (error) {
     console.error(error);
     toast.error(error.message);
   }

  }

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    setToken(null);
    setUser(null);
    setCredit(null);
  }


  useEffect(() => {
    if (token) {
      loadCreditsData();
    }
  }, [token]);


  const value = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    backendUrl,token,setToken,credit,setCredit, loadCreditsData , logout, generateImage
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
}

export default AppContextProvider;

