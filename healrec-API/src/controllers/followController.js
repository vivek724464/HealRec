const Doctor = require("../models/docSchema");
const Patient = require("../models/patientSchema");
const{publishFollowAccepted, publishFollowRevoked,}= require("../config/rabbitUtil");

const sendFolloRequest = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { doctorId } = req.body;
        if (!doctorId) {
            return res.json({
                success: false,
                message: "doctorId is required"
            })
        }
        const doctor = await Doctor.findById(doctorId);
        const patient = await Patient.findById(patientId);

        if (!doctor || !patient) {
            return res.json({
                success: false,
                message: "Doctor or Patient not found"
            })
        }
        const existingRequest = doctor.followRequests.find((r) =>
            r.patient.toString() === patientId
        )
        if (existingRequest) {
            return res.json({
                success: false,
                message: "Request already sent"
            })
        }
        doctor.followRequests.push({ patient: patientId, status: "pending" });
        patient.followingDoctors.push({ doctor: doctorId, status: "pending" });


        await doctor.save();
        await patient.save();

        return res.json({
            success: true,
            message: "Follow request sent"
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

const sendUnfollowRequest = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { doctorId } = req.body;
        if (!doctorId) {
            return res.json({
                success: false,
                message: "doctorId is required"
            })
        }
        const doctor = await Doctor.findById(doctorId);
        const patient = await Patient.findById(patientId);
        if (!doctor || !patient) {
            return res.json({
                success: false,
                message: "Doctor or Patient not found",
            });
        }

        const followEntry = patient.followingDoctors.find((f) => f.doctor.toString() === doctorId.toString());
        if (!followEntry) {
            return res.json({
                success: false,
                message: "You are not following or haven't requested to follow this doctor"
            })
        }
        const doesDochaveReq = doctor.followRequests.find((r) => r.doctor.toString() === doctorId.toString());
        if (!doesDochaveReq) {
            return res.json({
                success: false,
                message: "Follow request not found in doctor's record"
            })
        }
        if (doesDochaveReq.status === "pending") {
            doctor.followRequests = doctor.followRequests.filter((f) => f.patient.toString() !== patientId.toString());
            patient.followingDoctors = patient.followingDoctors.filter((r) => r.doctor.toString() !== doctorId.toString());

            await doctor.save();
            await patient.save();
            return res.json({
                success: true,
                message: "Follow request canceled successfully"
            })
        }

        if (doesDochaveReq.status === "accepted") {
            doctor.followRequests = doctor.followRequests.filter((f) => f.patient.toString() !== patientId.toString());
            patient.followingDoctors = patient.followingDoctors.filter((r) => r.doctor.toString() !== doctorId.toString());

            await doctor.save();
            await patient.save();
            return res.json({
                success: true,
                message: "Doctor unfollwed successfully"
            })
        }
        return re.json({
            success: false,
            message: "Cannot unfollow. Follow request already declined.",
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

const acceptFollowRequest = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { patientId } = req.body;
        if (!patientId) {
            return res.json({
                success: false,
                message: "patientId is required"
            })
        }

        let patient = await Patient.findById(patientId);
        let doctor = await Doctor.findById(doctorId);

        if (!doctor || !patient) {
            return res.json({
                success: false,
                message: "Doctor or Patient not found"
            })
        }
        const request = doctor.followRequests.find((r) => r.patient.toString() === patientId.toString());
        if (!request) {
            return res.json({
                success: fasle,
                message: "No follow request found from this patient"
            });
        }
        if (request.status === "accepted") {
            return res.json({
                success: false,
                message: "Follow request already accepted"
            })
        }
        if (request.status === "declined") {
            return res.json({
                success: false,
                message: "Follow request already declined"
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
        return res.json({
            success: true,
            message: "Follow request accepted successfully",
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }

}

const declineFollowRequest = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { patientId } = req.body;
        if (!patientId) {
            return res.json({
                success: false,
                message: "patientId is required"
            })
        }
        const doctor = await Doctor.findById(doctorId);
        const patient = await Patient.findById(patientId);
        if (!patient || !doctor) {
            return res.json({
                success: false,
                message: "Patient or Doctor not found"
            })
        }
        const request = doctor.followRequests.find((r) => r.patientId.toString() === patientId.toString());
        if (!request) {
            return res.json({
                success: false,
                message: "No follow request found from this patient"
            })
        }
        if (request.status == "accepted") {
            return res.json({
                success: false,
                message: "Request already accepted"
            })
        }
        if (request.status == "declined") {
            return res.json({
                success: false,
                message: "Request already declined"
            })
        }

        request.status = "declined";
        const patientFollow = patient.followingDoctors.find((f) => f.doctor.toString() === doctorId.toString());
        if (patientFollow) {
            patientFollow.status = "declined";
        }
        await doctor.save();
        await patient.save();
        await publishFollowRevoked(doctorId, patientId);
        return res.json({
            success: true,
            message: "Request declined successfully"
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })

    }
}

const getPendingFollowRequests = async (req, res) => {
    try {
        const doctorId = req.user.id;
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
        const doctorId = req.user.id;
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
        const patientId = req.user.id;
        const patient = await Patient.findById(patientId).populate("followingDoctors.doctor", "name email doctorInfo");

        const accepted = patient.followingDoctors.filter(f => f.status === "accepted");

        return res.json({
            success: true,
            following: accepted
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { sendFolloRequest, sendUnfollowRequest, acceptFollowRequest, declineFollowRequest, getPendingFollowRequests, getDoctorFollowers, getFollowingDoctors };