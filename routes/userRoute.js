const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const AppointmentDetails = require("../models/doctorAppointmentModel");

const emailNotificationPage = require("../notification/notification");

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

router.get("/get-location", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "Location not available", success: true });
    } else {
      const locations = await Location.find({});
      res.status(200).send({
        message: "Location fetched successfully",
        success: true,
        data: locations,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error finding locations",
      success: false,
      error,
    });
  }
});

router.post("/book-appointment", authMiddleware, async (req, res) => {
  try {
    req.body.status = "pending";
    const formatedDate = moment(req.body.date, "DD-MM-YYYY").format(
      "YYYY-MM-DD"
    );
    req.body.date = formatedDate;
    req.body.time = req.body.time;
    const newAppointment = new AppointmentDetails(req.body);
    await newAppointment.save();
    const userName = req.body.userInfo?.name;
    const doctor = req.body?.doctorInfo;
    const doctorName = `${doctor?.firstName} ${doctor?.lastName}`;
    const date = moment(req.body?.date).format("ddd, DD-MMM-yyyy");
    const time = req.body?.time;

    const formattedTime = (time / 2).toString().includes(".5")
      ? moment((time / 2).toString().replace(".5", ":30"), ["HH:mm"]).format(
          "LT"
        )
      : moment((time / 2).toString(), "hh").format("LT");

    const recipientsAddress = [
      req.body?.userInfo?.email,
      req.body.doctorInfo?.email,
    ];
    const recipientDisplayName = [doctorName,userName]
    const customMsg = `Hi ${userName}, Your appointment has been confirmed with ${doctorName} on ${date} at ${formattedTime}.`;
    const emailResponse = await emailNotificationPage.sendEmail(
      recipientsAddress,
      recipientDisplayName,
      customMsg
    );
      
    res.status(200).send({
      message: "Appointment booked successfully",
      success: true,
      emailSentStatus: emailResponse?.status === "Succeeded" ? true : false,
      emailMsg:
        emailResponse?.status === "Succeeded"
          ? customMsg
          : "Sorry!! Unable to send an email.",
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
    const formatedDate = moment(req.body.date, "DD-MM-YYYY").format(
      "YYYY-MM-DD"
    );
    console.log("fomattedDate", formatedDate);
    req.body.date = formatedDate;
    const date = formatedDate;
    const fromTime = req.body.time;
    const doctorId = req.body.doctorId;
    const appointments = await AppointmentDetails.find({
      doctorId,
      date,
      time: fromTime,
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
    const appointments = await AppointmentDetails.find({
      userId: req.body.userId,
    });

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

router.post("/change-appointment-status-by-id",authMiddleware,async(req,res)=>{
  try {
    const { appointmentId, status } = req.body;
    const appointmentStatus = await AppointmentDetails.findByIdAndUpdate(appointmentId, {
      bookingStatus:status,
    });
    res.status(200).send({
      message: "Appointment status updated successfully",
      success: true,
      data: appointmentStatus,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error updating booking appointment",
      success: false,
      error,
    });
  }
})

module.exports = router;
