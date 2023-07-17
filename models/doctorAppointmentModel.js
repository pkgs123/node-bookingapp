const mongoose = require("mongoose");

const doctorAppointmentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
      },
    doctorId: {
        type: String,
        required: true,
      }, 
    date: {
        type: Date,
        required: true,
      },
    time: {
        type: String,
        required: true,
      },
},
{
  timestamps: true,
}
)

const doctorAppointmentModel = mongoose.model("appointments",doctorAppointmentSchema);
module.exports = doctorAppointmentModel;