/**
 * Decodes a JWT string and extracts payload claims.
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Error decoding JWT token:', err);
    return null;
  }
};

/**
 * Checks whether a decoded JWT has passed its expiration time.
 */
export const isTokenExpired = (decoded) => {
  if (!decoded || !decoded.exp) return false;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};
