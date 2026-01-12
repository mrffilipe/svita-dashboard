import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  'custom:isPlatformAdmin'?: string;
  email_verified: boolean;
  [key: string]: any;
}

export const decodeJwt = (token: string): JwtPayload => {
  return jwtDecode<JwtPayload>(token);
};

export const extractIsPlatformAdmin = (idToken: string): boolean => {
  try {
    const decoded = decodeJwt(idToken);
    return decoded['custom:isPlatformAdmin'] === 'true';
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return false;
  }
};
