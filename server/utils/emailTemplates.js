export function verficationOtpEmail(otp) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e0e6f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0d6efd, #4d8cff); padding: 30px; text-align: center; border-bottom: 1px solid #e0e6f0;">
        <h1 style="color: #ffffff; font-size: 30px; font-weight: 700; margin: 0;">EduTrack</h1>
        <p style="color: #d0e1ff; font-size: 16px; margin: 8px 0 0;">Account Verification</p>
      </div>

      <!-- Main Content -->
      <div style="background-color: #ffffff; padding: 35px 30px; text-align: center;">
        
        <h2 style="color: #1a2a44; font-size: 26px; font-weight: 600; margin-bottom: 12px;">Confirm Your Identity</h2>
        <p style="color: #5c6c88; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">Use the code below to complete your verification. This code is valid for 15 minutes.</p>

        <!-- OTP -->
        <div style="background-color: #f1f5ff; color: #0d6efd; font-size: 40px; font-weight: 700; letter-spacing: 10px; padding: 18px 0; border-radius: 10px; margin-bottom: 30px; max-width: 320px; margin-left: auto; margin-right: auto; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
          ${otp}
        </div>
        
        <p style="color: #5c6c88; font-size: 14px; line-height: 1.5;">If you did not request this code, you can safely ignore this email. Your account remains secure.</p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; color: #5c6c88; text-align: center; padding: 25px; font-size: 13px;">
        <p style="margin: 0;">© 2025 EduTrack. All rights reserved.</p>
      </div>
    </div>
  `;
}

export function forgotPasswordEmail(resetPasswordUrl) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e0e6f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0d6efd, #4d8cff); padding: 30px; text-align: center; border-bottom: 1px solid #e0e6f0;">
        <h1 style="color: #ffffff; font-size: 30px; font-weight: 700; margin: 0;">EduTrack</h1>
        <p style="color: #d0e1ff; font-size: 16px; margin: 8px 0 0;">Password Reset</p>
      </div>

      <!-- Main Content -->
      <div style="background-color: #ffffff; padding: 35px 30px; text-align: center;">
         
        <h2 style="color: #1a2a44; font-size: 26px; font-weight: 600; margin-bottom: 12px;">Reset Your Password</h2>
        <p style="color: #5c6c88; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new one. This link will expire in 15 minutes.</p>

        <!-- Reset Button -->
        <a href="${resetPasswordUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #0d6efd, #4d8cff); color: #ffffff; padding: 16px 35px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; margin-bottom: 20px; transition: background 0.3s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          Reset Password
        </a>
        
        <!-- Fallback Link -->
        <p style="color: #5c6c88; font-size: 13px; margin-top: 20px; margin-bottom: 5px;">If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 13px; word-break: break-all; margin-top: 0; margin-bottom: 25px;"><a href="${resetPasswordUrl}" style="color: #0d6efd; text-decoration: underline;">${resetPasswordUrl}</a></p>
        
        <p style="color: #5c6c88; font-size: 14px; line-height: 1.5;">If you did not request a password reset, please disregard this email. Your account remains secure.</p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; color: #5c6c88; text-align: center; padding: 25px; font-size: 13px;">
        <p style="margin: 0;">© 2025 EduTrack. All rights reserved.</p>
      </div>
    </div>
  `;
}

export function contactFormAdminEmail(name, email, phone, subject, message) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e0e6f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0d6efd, #4d8cff); padding: 30px; text-align: center; border-bottom: 1px solid #e0e6f0;">
        <h1 style="color: #ffffff; font-size: 30px; font-weight: 700; margin: 0;">EduTrack</h1>
        <p style="color: #d0e1ff; font-size: 16px; margin: 8px 0 0;">New Contact Form Submission</p>
      </div>

      <!-- Main Content -->
      <div style="background-color: #ffffff; padding: 35px 30px;">
              
        <h2 style="color: #1a2a44; font-size: 26px; font-weight: 600; margin-bottom: 25px; text-align: center;">New Contact Form Submission</h2>
        
        <!-- Contact Details -->
        <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #5c6c88; font-weight: 500; width: 120px;">Name:</td>
              <td style="padding: 10px 0; color: #1a2a44; font-weight: 600;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #5c6c88; font-weight: 500;">Email:</td>
              <td style="padding: 10px 0; color: #1a2a44; font-weight: 600;">${email}</td>
            </tr>
            ${phone ? `
              <tr>
                <td style="padding: 10px 0; color: #5c6c88; font-weight: 500;">Phone:</td>
                <td style="padding: 10px 0; color: #1a2a44; font-weight: 600;">${phone}</td>
              </tr>
            ` : ''}
            ${subject ? `
              <tr>
                <td style="padding: 10px 0; color: #5c6c88; font-weight: 500;">Subject:</td>
                <td style="padding: 10px 0; color: #1a2a44; font-weight: 600;">${subject}</td>
              </tr>
            ` : ''}
          </table>
        </div>
        
        <!-- Message -->
        <div style="background-color: #f1f5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0d6efd;">
          <h3 style="color: #1a2a44; margin: 0 0 15px 0; font-size: 18px;">Message:</h3>
          <p style="color: #5c6c88; line-height: 1.6; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div style="text-align: center; margin-top: 25px;">
          <p style="color: #5c6c88; font-size: 14px; margin: 0;">
            <em>This message was sent from the EduTrack contact form.</em>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; color: #5c6c88; text-align: center; padding: 25px; font-size: 13px;">
        <p style="margin: 0;">© 2025 EduTrack. All rights reserved.</p>
      </div>
    </div>
  `;
}

export function contactFormConfirmationEmail(name, message) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e0e6f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #10b981, #34d399); padding: 30px; text-align: center; border-bottom: 1px solid #e0e6f0;">
        <h1 style="color: #ffffff; font-size: 30px; font-weight: 700; margin: 0;"> EduTrack</h1>
        <p style="color: #d1fae5; font-size: 16px; margin: 8px 0 0;">Message Received</p>
      </div>

      <!-- Main Content -->
      <div style="background-color: #ffffff; padding: 35px 30px; text-align: center;">
        
    
        <h2 style="color: #1a2a44; font-size: 26px; font-weight: 600; margin-bottom: 12px;">Thank you for contacting EduTrack!</h2>
        <p style="color: #5c6c88; font-size: 16px; margin-bottom: 25px; line-height: 1.6;">
          Dear ${name},<br><br>
          We have received your message and will get back to you within 24 hours during business days.
        </p>

        <!-- Message Summary -->
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: left;">
          <h3 style="color: #1a2a44; margin: 0 0 15px 0; font-size: 18px;">Your message:</h3>
          <p style="color: #5c6c88; line-height: 1.6; margin: 0; padding: 15px; background-color: #ffffff; border-radius: 6px; border-left: 3px solid #10b981;">
            ${message.replace(/\n/g, '<br>')}
          </p>
        </div>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px;">
          <p style="color: #065f46; margin: 0; font-weight: 500;">
            For urgent matters, feel free to call us directly.<br>
            You can also reply to this email if you have additional questions.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; color: #5c6c88; text-align: center; padding: 25px; font-size: 13px;">
        <p style="margin: 0; font-weight: 600;">Best regards,</p>
        <p style="margin: 5px 0;">EduTrack Team</p>
        <p style="margin: 15px 0 0;">© 2025 EduTrack. All rights reserved.</p>
      </div>
    </div>
  `;
}