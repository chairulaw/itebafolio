export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const OTP_EXPIRY_MINUTES = 10;

export const getOtpExpiry = () => {
    return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};
