const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify.html?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - IIoT Temperature System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #4a3f8f; padding: 40px; border-radius: 10px;">
        <h1 style="color: #ffffff; text-align: center;">IIoT Temperature System</h1>
        <div style="background: white; padding: 30px; border-radius: 8px; margin-top: 20px;">
          <h2 style="color: #4a3f8f;">Verify Your Email</h2>
          <p style="color: #333; line-height: 1.6;">Thank you for signing up! Please click the button below to verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #e8a54b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password - IIoT Temperature System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #4a3f8f; padding: 40px; border-radius: 10px;">
        <h1 style="color: #ffffff; text-align: center;">IIoT Temperature System</h1>
        <div style="background: white; padding: 30px; border-radius: 8px; margin-top: 20px;">
          <h2 style="color: #4a3f8f;">Reset Your Password</h2>
          <p style="color: #333; line-height: 1.6;">You requested to reset your password. Click the button below to proceed.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #e8a54b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendTemperatureAlert = async (email, alertData) => {
  const { temperature, threshold, alertType, room, timestamp } = alertData;
  const isHot = alertType === 'hot';
  const alertColor = isHot ? '#e8a54b' : '#5a4a9f';
  const alertTitle = isHot ? 'High Temperature Alert' : 'Low Temperature Alert';
  const alertMessage = isHot 
    ? `Temperature has exceeded the maximum threshold of ${threshold}°C`
    : `Temperature has dropped below the minimum threshold of ${threshold}°C`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `⚠️ ${alertTitle} - IIoT Temperature System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #4a3f8f; padding: 40px; border-radius: 10px;">
        <h1 style="color: #ffffff; text-align: center;">IIoT Temperature System</h1>
        <div style="background: white; padding: 30px; border-radius: 8px; margin-top: 20px;">
          <div style="background: ${alertColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 1.5em;">⚠️ ${alertTitle}</h2>
          </div>
          
          <p style="color: #333; line-height: 1.6; font-size: 1.1em;">
            ${alertMessage}
          </p>
          
          <div style="background: #f8f7fc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${alertColor};">
            <p style="margin: 8px 0;"><strong>Current Temperature:</strong> ${temperature.toFixed(1)}°C</p>
            <p style="margin: 8px 0;"><strong>Threshold:</strong> ${threshold}°C</p>
            <p style="margin: 8px 0;"><strong>Location:</strong> ${room}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${timestamp}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Please check your monitoring system immediately and take appropriate action to maintain optimal temperature conditions.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/index.html" style="background: #4a3f8f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Dashboard</a>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated alert from your IIoT Temperature Monitoring System
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendTemperatureAlert };
