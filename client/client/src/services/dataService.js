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

  /* ================= FOLLOWED DOCTORS ================= */
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


  /* ================= SEARCH DOCTORS ================= */
  searchDoctors: async (query) => {
    if (!query || query.trim().length < 2) {
      return { data: [] };
    }

    const response = await api.get(
      `/patient/search-doctors?q=${encodeURIComponent(query)}`
    );

    return { data: response.data.doctors || [] };
  },

  /* ================= FOLLOW ACTION ================= */
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

};
