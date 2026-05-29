import jwt from "jsonwebtoken";

export const isAuthentic = async (Role, req) => {
  try {
    const authHeader =
      req.headers?.get("authorization") ||
      req.headers?.get("Authorization");

    const token =
      req.cookies?.get("accessToken")?.value ||
      authHeader?.split(" ")[1];

    if (!token) return { isAuth: false };

    let payload;

    try {
      payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      console.log("JWT ERROR:", err.message);
      return { isAuth: false };
    }

    const isAdmin = payload.role === "admin";
    const hasRole = !Role || payload.role === Role;
    console.log(`hasRole ${hasRole} isAdmin ${isAdmin}`)

    if (!isAdmin && !hasRole) {
      return { isAuth: false };
    }

    return {
      isAuth: true,
      data: { ...payload, id: payload.id || payload._id },
    };

  } catch (error) {
    return { isAuth: false };
  }
};