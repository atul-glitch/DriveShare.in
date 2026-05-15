const normalizeSameSite = (value = "") => {
  const normalized = value.toLowerCase();

  if (normalized === "none" || normalized === "strict" || normalized === "lax") {
    return normalized;
  }

  return "lax";
};

const parseBoolean = (value) => {
  if (value === undefined) {
    return undefined;
  }

  return value.toLowerCase() === "true";
};

export const getCookieOptions = ({ maxAge } = {}) => {
  const sameSite = normalizeSameSite(
    process.env.COOKIE_SAME_SITE ||
      (process.env.NODE_ENV === "production" ? "none" : "lax")
  );

  const requestedSecure = parseBoolean(process.env.COOKIE_SECURE);
  const secure = sameSite === "none" ? true : requestedSecure ?? process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure,
    sameSite,
  };

  if (typeof maxAge === "number") {
    options.maxAge = maxAge;
  }

  return options;
};

export const getCorsOptions = () => {
  const rawOrigins = process.env.CORS_ORIGIN?.trim();

  if (!rawOrigins || rawOrigins === "*") {
    return {
      origin: true,
      credentials: true,
    };
  }

  const origins = rawOrigins
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  return {
    origin: origins.length <= 1 ? origins[0] : origins,
    credentials: true,
  };
};
