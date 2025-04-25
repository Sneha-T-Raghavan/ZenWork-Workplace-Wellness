import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

// Register function to create a new user and set cookie

export const register = async (req, res) => {
  const { name, email, password, cpassword } = req.body;

  if (!name || !email || !password || !cpassword) {
    return res.json({ success: false, message: "Missing details" });
  }
  if (password != cpassword) {
    return res.json({ success: false, message: "Confirm Password not matching" });
  }
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedcPassword = await bcrypt.hash(cpassword, 10);
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      cpassword: hashedcPassword,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

     //Sending Welcome mail
     const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: `Welcome to ZenWork Workplace Wellness`,
      text: `Welcome to ZenWork. Your account has been created successfully with email id: ${email}`
  }

  await transporter.sendMail(mailOptions);


  return res.json({success: true});

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Login function to authenticate user and set cookie

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Logout function to clear the cookie and send a response

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:
        process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Send Verification OTP to users email

export const sendVerifyOtp = async (req, res) => {
    try {
        const {userId} = req.body;
        const user = await userModel.findById(userId);

        if (user.isAccountVerified){
            return res.json({success: false, message: "Account Already verified"})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `Account OTP verification`,
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        }

        await transporter.sendMail(mailOption);

        res.json({success: true, message: 'Verifcation OTP Sent to Registered Email'});

    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

//Verify Email function to check the OTP and verify the user

export const verifyEmail = async (req, res) =>{
  const {userId, otp} = req.body;

  if (!userId || !otp){
      return res.json({success: false, message:'Missong Details'});
  }
  try {
      const user = await userModel.findById(userId);

      if(!user){
          return res.json({success: false, message:'User Not found'});
      }

      if(user.verifyOtp === '' | user.verifyOtp != otp){
          return res.json({success: false, message:'Invalid OTP'});
      }

      if(user.verifyOtpExpireAt < Date.now()){
          return res.json({success: false, message:'OTP expired'});
      }

      user.isAccountVerified = true;
      user.verifyOtp = '';
      user.verifyOtpExpireAt = 0;

      await user.save();
      res.json({success: true, message: 'Email verified Successfully'});

  } catch (error) {
      return res.json({success: false, message: error.message});
  }
};

//Check if user is authenticated

export const isAuthenticated = async (req, res) => {
  try {
      res.json({success: true});
  } catch (error) {
      res.json({success: false, message: error.message});
  }
};

//Send Password Reset OTP

export const sendResetOtp = async (req, res) => {
  const {email} = req.body;

  if(!email) {
      return res.json({success: false, message:'Email is required'})
  }
  try {
      
      const user = await userModel.findOne({email});
      if(!user){
          res.json({success: false, message: "User not found"});
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));

      user.resetOtp = otp;
      user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

      await user.save();

      const mailOption = {
          from: process.env.SENDER_EMAIL,
          to: user.email,
          subject: `Reset Password OTP`,
          text: `Your OTP is ${otp}. Reset your password using this OTP.`
      };

      await transporter.sendMail(mailOption);

      res.json({success: true, message: 'Reset OTP Sent to your Email'});
  } catch (error) {
      return res.json({success: false, message: error.message});
  }
};

// Reset User Password

export const resetPassword = async (req, res)=> {
  const {email, otp, newPassword, newcPassword} = req.body;

  if(!email || !otp || !newPassword || !newcPassword){
      return res.json({success: false, message: 'Email, OTP, new password, new confirm password are required'});
  }
  try {
      
      const user = await userModel.findOne({email});
      if(!user){
          return res.json({success: false, message: 'User not found'});
      }

      if (newPassword !== newcPassword){
        return res.json({success: false, message: 'Confirm Password not matching'});
    }

      if(user.resetOtp === "" || user.resetOtp !== otp){
          return res.json({success: false, message: 'Invalid OTP'});
      }

      if (user.resetOtpExpireAt < Date.now()){
          return res.json({success: false, message: 'OTP Expired'})
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const hashedcPassword = await bcrypt.hash(newcPassword, 10);
      user.password = hashedPassword;
      user.cpassword = hashedcPassword;
      user.resetOtp = '',
      user.resetOtpExpireAt = 0;

      await user.save();
      return res.json({success: true, message: 'Password has been reset successfully'});

  } catch (error) {
      return res.json({success: false, message: error.message});
  }
}