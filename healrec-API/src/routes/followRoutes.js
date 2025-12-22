const express = require("express");
const router = express.Router();

const { sendFollowRequest,
    sendUnfollowRequest,
    acceptFollowRequest,
    declineFollowRequest,
    getPendingFollowRequests,
    getDoctorFollowers,
    getFollowingDoctors } = require("../controllers/followController");
const {isLoggedIn, isPatient, isDoctor}=require("../middleware/authmiddleware");

router.post("/follow-request", isLoggedIn, isPatient, sendFollowRequest);
router.post("/accept-request", isLoggedIn, isDoctor, acceptFollowRequest);
router.post("/decline-request", isLoggedIn, isDoctor, declineFollowRequest);
router.post("/unfollow-request", isLoggedIn, isPatient, sendUnfollowRequest);

router.get("/get-Pending-requests", isLoggedIn, isDoctor, getPendingFollowRequests);
router.get("/get-followed-doctors", isLoggedIn, isPatient, getFollowingDoctors);
router.get("/get-followers",isLoggedIn, isDoctor, getDoctorFollowers);

module.exports=router;