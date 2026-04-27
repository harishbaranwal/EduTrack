import { sendEmail } from "../utils/sendEmail.js";
import { contactFormAdminEmail, contactFormConfirmationEmail } from "../utils/emailTemplates.js";
import contactInfo from "../data/contactInfo.json" with { type: "json" };

// Contact form submission
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Prepare email content
    const emailSubject = subject ? `Contact Form: ${subject}` : "New Contact Form Submission";
    const emailMessage = contactFormAdminEmail(name, email, phone, subject, message);

    // Send email to Admin
    await sendEmail({
      email: process.env.SMTP_EMAIL,
      subject: emailSubject,
      message: emailMessage
    });

    // Send confirmation email to user
    const confirmationMessage = contactFormConfirmationEmail(name, message);

    await sendEmail({
      email: email,
      subject: "Message Received - EduTrack",
      message: confirmationMessage
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon."
    });

  } catch (error) {res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later."
    });
  }
};

// Get contact information
export const getContactInfo = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: contactInfo
    });
  } catch (error) {res.status(500).json({
      success: false,
      message: "Failed to fetch contact information."
    });
  }
};
