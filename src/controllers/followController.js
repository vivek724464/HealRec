const Doctor = require("../models/docSchema");
const Patient = require("../models/patientSchema");

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
        if (doctor.followRequests.includes(patientId)) {
            return res.json({
                success: false,
                message: "Follow request already sent"
            })
        }
        if (patient.followingDoctors.includes(doctorId)) {
            return res.json({
                success: false,
                message: "Already following this doctor"
            })
        }
        doctor.followRequests.push(patientId);
        patient.pendingRequests.push(doctorId);

        await doctor.save();
        await patient.save();

        return res.json({
            success: true,
            message: "Follow request sent ti doctor"
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

        let isFollwing=doctor.followers.includes(patientId);
        let hasRequested=doctor.followRequests.includes(patientId);

        if(!isFollwing && !hasRequested){
            return res.json({
                success:false,
                message:"You are not following or haven't requested to follow this doctor"
            })
        }

        if(isFollwing){
             doctor.followers = doctor.followers.filter((id) => id.toString() !== patientId.toString());
                patient.followingDoctors = patient.followingDoctors.filter((id) => id.toString() !== doctorId.toString());
        }
        if(hasRequested){
               doctor.followRequests = doctor.followRequests.filter((id) => id.toString() !== patientId.toString());
                patient.pendingRequests = patient.pendingRequests.filter((id) => id.toString() !== doctorId.toString());
        }
        await doctor.save();
        await patient.save();

        return res.json({
            success:true,
            message:"Unfollowed doctor successfully"
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}