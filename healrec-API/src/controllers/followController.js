const Doctor = require("../models/docSchema");
const Patient = require("../models/patientSchema");
const{publishFollowAccepted, publishFollowRevoked, publishFollowUnfollowed}= require("../config/rabbitUtil");
const { notifyUser } = require("../websocket/wsServer");


const sendFollowRequest = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "doctorId is required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      return res.status(404).json({
        success: false,
        message: "Doctor or Patient not found",
      });
    }

    const exists = doctor.followRequests.find(
      (r) => r.patient.toString() === patientId.toString()
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Follow request already exists",
      });
    }

    doctor.followRequests.push({
      patient: patientId,
      status: "pending",
    });

    patient.followingDoctors.push({
      doctor: doctorId,
      status: "pending",
    });

    await doctor.save();
    await patient.save();

  await notifyUser(
  doctorId,
  "doctor",
  "FOLLOW_REQUEST",
  {
    patientId: patient._id,
    patientName: patient.name,
    email: patient.email || "",
    address: patient.address || "Not provided",
  }
);

    return res.json({
      success: true,
      message: "Follow request sent",
    });
  } catch (error) {
    console.error("sendFollowRequest error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const sendUnfollowRequest = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: "doctorId required" });
    }

    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      return res.status(404).json({ message: "Doctor or Patient not found" });
    }

    const doctorRequest = doctor.followRequests.find(
      (r) => r.patient.toString() === patientId.toString()
    );

    if (!doctorRequest) {
      return res.status(400).json({
        message: "No follow relationship found",
      });
    }

    const patientFollow = patient.followingDoctors.find(
      (f) => f.doctor.toString() === doctorId.toString()
    );

    if (!patientFollow) {
      return res.status(400).json({
        message: "No follow relationship found",
      });
    }

    if (doctorRequest.status === "pending") {
      doctor.followRequests = doctor.followRequests.filter(
        (r) => r.patient.toString() !== patientId.toString()
      );

      patient.followingDoctors = patient.followingDoctors.filter(
        (f) => f.doctor.toString() !== doctorId.toString()
      );

      await doctor.save();
      await patient.save();
      await notifyUser(doctorId, "doctor", "FOLLOW_REQUEST_CANCELLED", {
        patientId: patient._id.toString(),
        patientName: patient.name,
      });

      return res.json({
        success: true,
        message: "Follow request cancelled",
      });
    }
    if (doctorRequest.status === "accepted") {
      doctor.followRequests = doctor.followRequests.filter(
        (r) => r.patient.toString() !== patientId.toString()
      );

      patient.followingDoctors = patient.followingDoctors.filter(
        (f) => f.doctor.toString() !== doctorId.toString()
      );

      await doctor.save();
      await patient.save();

    await publishFollowUnfollowed(doctorId, patientId);

      await notifyUser(doctorId, "doctor", "FOLLOW_UNFOLLOWED", {
        patientId: patient._id.toString(),
        patientName: patient.name,
      });

      return res.json({
        success: true,
        message: "Unfollowed successfully",
      });
    }
    return res.status(400).json({
      message: "Invalid follow state",
    });
  } catch (err) {
    console.error("Unfollow error:", err);
    return res.status(500).json({ message: err.message });
  }
};


const acceptFollowRequest = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.body;

    if (!patientId) {
      return res.json({
        success: false,
        message: "patientId is required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      return res.json({
        success: false,
        message: "Doctor or Patient not found",
      });
    }

    const request = doctor.followRequests.find(
      (r) => r.patient.toString() === patientId.toString()
    );

    if (!request) {
      return res.json({
        success: false,
        message: "No follow request found from this patient",
      });
    }

    if (request.status !== "pending") {
      return res.json({
        success: false,
        message: `Request already ${request.status}`,
      });
    }
    request.status = "accepted";

    const patientFollow = patient.followingDoctors.find(
      (f) => f.doctor.toString() === doctorId.toString()
    );

    if (patientFollow) {
      patientFollow.status = "accepted";
    } else {
      patient.followingDoctors.push({
        doctor: doctorId,
        status: "accepted",
      });
    }

    await doctor.save();
    await patient.save();
    await publishFollowAccepted(doctorId, patientId);
    await notifyUser(patientId, "patient", "FOLLOW_ACCEPTED", {
      doctorId: doctor._id.toString(),
      doctorName: doctor.name,
    });

    return res.json({
      success: true,
      message: "Follow request accepted successfully",
    });
  } catch (error) {
    console.error("Accept follow error:", error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};


const declineFollowRequest = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.body;

    if (!patientId) {
      return res.json({
        success: false,
        message: "patientId is required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      return res.json({
        success: false,
        message: "Patient or Doctor not found",
      });
    }

    const request = doctor.followRequests.find(
      (r) => r.patient.toString() === patientId.toString()
    );

    if (!request) {
      return res.json({
        success: false,
        message: "No follow request found from this patient",
      });
    }

    if (request.status !== "pending") {
      return res.json({
        success: false,
        message: `Request already ${request.status}`,
      });
    }

    doctor.followRequests = doctor.followRequests.filter(
      (r) => r.patient.toString() !== patientId.toString()
    );

    patient.followingDoctors = patient.followingDoctors.filter(
      (f) => f.doctor.toString() !== doctorId.toString()
    );

    await doctor.save();
    await patient.save();

    await notifyUser(patientId, "patient", "FOLLOW_DECLINED", {
      doctorId: doctor._id.toString(),
      doctorName: doctor.name,
    });

    return res.json({
      success: true,
      message: "Request declined successfully",
    });
  } catch (error) {
    console.error("Decline follow error:", error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
const removePatient = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId is required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);


    if (!doctor || !patient) {
      return res.status(404).json({
        success: false,
        message: "Doctor or Patient not found",
      });
    }
    const followEntry = doctor.followRequests.find(
      (r) => r.patient.toString() === patientId.toString()
    );

    if (!followEntry) {
      return res.status(400).json({
        success: false,
        message: "Patient is not found in your followers list",
      });
    }
    if (followEntry.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "This patient is not a connected follower (status is pending or other)",
      });
    }
    doctor.followRequests = doctor.followRequests.filter(
      (r) => r.patient.toString() !== patientId.toString()
    );

    patient.followingDoctors = patient.followingDoctors.filter(
      (f) => f.doctor.toString() !== doctorId.toString()
    );

    await doctor.save();
    await patient.save();
    await publishFollowRevoked(doctorId, patientId);
    await notifyUser(patientId, "patient", "REMOVED_BY_DOCTOR", {
      doctorId: doctor._id.toString(),
      doctorName: doctor.name,
    });


    return res.json({
      success: true,
      message: "Patient removed successfully",
    });

  } catch (error) {
    console.error("Remove patient error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getPendingFollowRequests = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const doctor = await Doctor.findById(doctorId).populate("followRequests.patient", "name email");

        const pending = doctor.followRequests.filter(r => r.status === "pending");

        return res.json({
            success: true,
            pendingRequests: pending
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};


const getDoctorFollowers = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const doctor = await Doctor.findById(doctorId).populate("followRequests.patient", "name email patientInfo");

        const accepted = doctor.followRequests.filter(r => r.status === "accepted");

        return res.json({
            success: true,
            followers: accepted
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

const getFollowingDoctors = async (req, res) => {
  try {
    const patientId = req.user._id;

    const patient = await Patient.findById(patientId).populate(
      "followingDoctors.doctor",
      "name email specialization experience rating"
    );

    return res.json({
      success: true,
      following: patient.followingDoctors,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = { sendFollowRequest, sendUnfollowRequest, acceptFollowRequest, declineFollowRequest, getPendingFollowRequests, getDoctorFollowers, getFollowingDoctors, removePatient };