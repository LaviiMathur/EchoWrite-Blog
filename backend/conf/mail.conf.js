export const otpEmailTemplate = (otp) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Account</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eeeeee;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #6855E0;
      margin-bottom: 10px;
    }
    .logo img {
      max-width: 150px; /* Adjust the width of the logo */
      height: auto;
    }
    .content {
      padding: 30px 20px;
      text-align: center;
    }
    .otp-box {
      letter-spacing: 5px;
      font-size: 32px;
      font-weight: bold;
      background-color: #f0edff;
      color: #6855E0;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      text-align: center;
    }
    .expiry-note {
      font-size: 14px;
      color: #777777;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #999999;
      padding: 20px 0;
      border-top: 1px solid #eeeeee;
    }
    .button {
      display: inline-block;
      background-color: #6855E0;
      color: white;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 20px;
    }
    .security-note {
      background-color: #fff8e1;
      border-left: 4px solid #ffc107;
      padding: 10px 15px;
      margin: 20px 0;
      font-size: 14px;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <img src="https://res.cloudinary.com/dpfmmqggy/image/upload/v1740602621/uqejs7kzea0f2i0xxex1.png" alt="EchoWrite Logo" />
      </div>
      <p>Account Verification</p>
    </div>
    
    <div class="content">
      <h2>Verify Your Email Address</h2>
      <p>Thank you for signing up! Please use the verification code below to complete your registration.</p>
      
      <div class="otp-box">${otp}</div>
      
      <p>This code will expire in 5 minutes.</p>
      
      <div class="security-note">
        <strong>⚠️ Security Notice:</strong> We will never ask for this code outside of our verification process. Do not share this code with anyone, including our support team.
      </div>
      
      <p>If you didn't create an account with us, you can safely ignore this email.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 EchoWrite. All rights reserved.</p>
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>`;




export const createMailOptions = (email, html) => {
  return {
    from: `"EchoWrite" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email OTP Verification", 
    html,
  };
};

export default {
  otpEmailTemplate,
  createMailOptions
};