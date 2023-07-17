const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctorModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const DoctorAppointment = require("../models/doctorAppointmentModel");
const User = require("../models/userModel");
const moment =require('moment');


router.post("/get-doctor-info-by-user-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting doctor info", success: false, error });
  }
});

router.post("/search-doctor",authMiddleware,async(req,res)=>{
  const {name,location} = req?.query;
  try{
     const doctor =  await Doctor.find({city:location})
     if(location && name){
    let doctorList = doctor?.filter(i=>i.firstName.toLowerCase().includes(name));
     res.status(200).send({
      success: true,
      message: doctorList.length >0 ? "Doctor fetched successfully" : "No records found",
      data: doctorList,
    });
  }
  else{
    res.status(400).send({
      success: true,
      message: "Property missing",
      data: doctorList,
    });
  }

    }
  catch(error){
    res
    .status(500)
    .send({ message: "Error getting doctor list", success: false, error });
  }
})
router.post("/search-doctor-by-specialization",authMiddleware,async(req,res)=>{
  const {specialization,location} = req?.query;
  try{
    
     const doctor =  await Doctor.find({city:location})
     if(location && specialization){
     let doctorList = doctor?.filter(i=>i.specialization.toLowerCase().includes(specialization.toLowerCase()));
     res.status(200).send({
      success: true,
      message: doctorList.length >0 ? "Doctor fetched successfully" : "No records found",
      data: doctorList,
    });
  }
  else{
    res.status(400).send({
      success: true,
      message: "Required parameter not passed",
      data: doctorList,
    });
  }
    }
  catch(error){
    res
    .status(500)
    .send({ message: "Error getting doctor list", success: false, error });
  }
})
router.post("/get-doctor-info-by-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting doctor info", success: false, error });
  }
});
router.post("/get-doctors-availability-by-id",async(req,res)=>{
  const payload = req.body?.doctorId;
try{
  const doctor = await Doctor.findOne({ _id: payload });
  const date = moment(new Date()).format("YYYY-MM-DD");
  console.log("date-api",date);
  const futureDate = moment(date).add(2,"days").format("YYYY-MM-DD");
  console.log("futureDate",futureDate);
  // date > currentDate && date < currentDate+2 && docId === payload
  if(doctor){
    console.log("checking",{"date" : { "$gte":date, "$lte":futureDate},"doctorId":payload })
    const appointmentDetails = await DoctorAppointment.find({date : { $gte:date, $lte:futureDate},doctorId:payload });
    if(appointmentDetails){
    const processData = {};
     
     appointmentDetails.forEach(d => {
      const date = moment(d.date).format("YYYY-MM-DD");
      if (!processData.hasOwnProperty(date)) {
          processData[date] = [];
      }
      processData[date].push(d);
  });
  console.log("processData",processData);
  const mrg = doctor.morningSlot;
  const afte = doctor.afterNoonSlot;
  const eve = doctor.eveningSlot;
  console.log("Mrg",mrg,"afte",afte,"eve",eve);
  const finalData = {};
  let p1 = [];
  let p2=[];
  let p3=[];

  for (const date in processData) {
    if (!finalData.hasOwnProperty(date)) {
      finalData[date] = {};
  }
      processData[date].forEach(i => {
          if (mrg.includes(+i.time)) {
              p1.push(i);
              finalData[date].Mrng = p1; 
          } else if (afte.includes(+i.time)) {
            p2.push(i);
            finalData[date].After = p2; 
          } else if (eve.includes(+i.time)) {
            p3.push(i);
            finalData[date].Eve=p3; 
          }        
      });
      p1 = [];p2=[];p3=[]
  };
      res.status(200).send({
        success: true,
        message: Object.keys(finalData).length >0 ? "Appointment details fetched successfully" : "No Records Found",
        data: finalData
      });
    }
  }
}
catch(error){
  console.log(error.message);
  res
  .status(500)
  .send({ message: "Error getting appointment details", success: false, error });
}
})

module.exports = router;
