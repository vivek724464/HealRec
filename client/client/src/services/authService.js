import api from "@/lib/api";

const emitAuthChanged = () => {
  window.dispatchEvent(new Event("healrec-auth-changed"));
};

export const authService = {
  requestSignupOtp: async (identifier, name, password, role) => {
    const response = await api.post("/users/signup", {
      identifier,
      name,
      password,
      role,
    });
    return response.data;
  },

  verifySignupOtp: async (identifier, otp) => {
    const response = await api.post("/users/verify-otp", {
      identifier,
      otp,
    });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post("/users/login", {
      username,
      password,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Login failed");
    }

    const { token, user } = response.data;

    authService.setSession(token, user);

    return user;
  },

  setSession: (token, user) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    emitAuthChanged();
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    emitAuthChanged();
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem("token");
  },
};
