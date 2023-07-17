const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const AppointmentDetails = require("../models/doctorAppointmentModel");
const Location = require("../models/locationModel");
const moment = require("moment");

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newuser = new User(req.body);
    await newuser.save();
    res
      .status(200)
      .send({ message: "User created successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error creating user", success: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Password is incorrect", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: "Login successful", success: true, data: token });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error logging in", success: false, error });
  }
});

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
});

router.get("/get-location",authMiddleware, async (req, res) =>{
  try{
    const user = await User.findOne({_id:req.body.userId});
    user.password = undefined;
    if(!user){
      return res.status(200).send({message: "Location not available",success:true})
    }
    else{
      const locations = await Location.find({})
      res.status(200).send({
        message: "Location fetched successfully",
        success: true,
        data: locations,
      });
    }
  }
  catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error finding locations",
      success: false,
      error,
    });
  }
})

router.post("/book-appointment", authMiddleware, async (req, res) => {
  try {
    req.body.status = "pending";
   const formatedDate =  moment(req.body.date, 'DD-MM-YYYY').format('YYYY-MM-DD');
   console.log("fomattedDate",formatedDate);
    req.body.date = formatedDate;
    req.body.time = req.body.time;
    console.log("body-date",typeof req.body.date);
    // moment(req.body.time, "HH:mm").toISOString();
    const newAppointment = new AppointmentDetails(req.body);
    await newAppointment.save();
    //pushing notification to doctor based on his userid
    // const user = await User.findOne({ _id: req.body.doctorInfo.userId });
    // user.unseenNotifications.push({
    //   type: "new-appointment-request",
    //   message: `A new appointment request has been made by ${req.body.userInfo.name}`,
    //   onClickPath: "/doctor/appointments",
    // });
    // await user.save();
    res.status(200).send({
      message: "Appointment booked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking appointment",
      success: false,
      error,
    });
  }
});

router.post("/check-booking-avilability", authMiddleware, async (req, res) => {
  try {
    const formatedDate =  moment(req.body.date, 'DD-MM-YYYY').format('YYYY-MM-DD');
   console.log("fomattedDate",formatedDate);
    req.body.date = formatedDate;
    const date = formatedDate;
    const fromTime = req.body.time;
    const doctorId = req.body.doctorId;
    const appointments = await AppointmentDetails.find({
      doctorId,
      date,
      time: fromTime
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not available",
        success: false,
      });
    } else {
      return res.status(200).send({
        message: "Appointments available",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking appointment",
      success: false,
      error,
    });
  }
});

router.get("/get-appointments-by-user-id", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.body.userId });
    res.status(200).send({
      message: "Appointments fetched successfully",
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching appointments",
      success: false,
      error,
    });
  }
}); 

module.exports = router;
 