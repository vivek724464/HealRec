import api from "@/lib/api";

export const dataService = {
  /* ================= REPORTS ================= */

  uploadReport: async (formData) => {
    const response = await api.post("/reports/uploadReport", formData);
    return response.data;
  },

  getReports: async (patientId) => {
    const response = await api.get(`/reports/${patientId}`);
    return { data: response.data.reports || [] };
  },

  /* ================= DOCTOR DASHBOARD ================= */

  // 🔹 Pending follow requests (doctor)
getPendingRequests: async () => {
  const res = await api.get("/followers/get-Pending-requests");
  return { data: res.data.pendingRequests || [] };
},

getDoctorPatients: async () => {
  const res = await api.get("/followers/get-followers");
  return { data: res.data.followers || [] };
},

getSharedRecords: async () => {
  // Doctor is NOT a patient → isPatient middleware blocks this
  return { data: [] };
},

  /* ================= PATIENT SIDE ================= */

  getFollowingDoctors: async () => {
    const res = await api.get("/followers/get-followed-doctors");

    const doctors = (res.data.following || []).map((f) => ({
      ...f.doctor,
      connectionStatus:
        f.status === "accepted"
          ? "connected"
          : f.status === "pending"
          ? "pending"
          : "none",
    }));

    return { data: doctors };
  },

  searchDoctors: async (query) => {
    if (!query || query.trim().length < 2) {
      return { data: [] };
    }

    const response = await api.get(
      `/patient/search-doctors?q=${encodeURIComponent(query)}`
    );

    return { data: response.data.doctors || [] };
  },

  /* ================= FOLLOW ACTIONS ================= */

  sendFollowRequest: async (doctorId) => {
    const res = await api.post("/followers/follow-request", { doctorId });
    return res.data;
  },

  sendUnfollowRequest: async (doctorId) => {
    const response = await api.post("/followers/unfollow-request", {
      doctorId,
    });
    return response.data;
  },
  unfollowAfterAccepted: async (doctorId) => {
  return api.post("/followers/unfollow-request", { doctorId });
},

  
  acceptFollowRequest: async (patientId) => {
    const res = await api.post("/followers/accept-request", { patientId });
    return res.data;
  },

  declineFollowRequest: async (patientId) => {
    const res = await api.post("/followers/decline-request", { patientId });
    return res.data;
  },
  removePatient: async (patientId) => {
    const res = await api.post("/followers/remove-patient", { patientId });
    return res.data;
  },
    getDoctorProfile: async () => {
    const res = await api.get("/doctor/me");
    return res.data;
  },

  // 🔹 Request update (sends OTP if email/phone changed)
  requestProfileUpdate: async (data) => {
    const res = await api.put("/doctor/update-profile", data);
    return res.data;
  },

  // 🔹 Verify OTP
  verifyProfileOtp: async (otp) => {
    const res = await api.post("/doctor/update-profile/verify-otp", { otp });
    return res.data;
  },
    getPatientProfile: async () => {
    const res = await api.get("/patient/profile");
    return res.data.user;
  },

  /* ================= UPDATE PROFILE ================= */
  updatePatientProfile: async (payload) => {
    const res = await api.put("/patient/update-profile", payload);
    return res.data;
  },

  verifyPatientProfileOtp: async (otp) => {
    const res = await api.post("/patient/update-profile/verify-otp", { otp });
    return res.data;
  },

};
