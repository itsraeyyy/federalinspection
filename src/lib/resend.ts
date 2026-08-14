export { sendEmail, wrapEmailTemplate } from "@/notifications/email-service";
export {
  buildRegistrationTemplates as buildRegistrationEmail,
  buildPasswordResetTemplates as buildPasswordResetEmail,
  buildAdminWelcomeTemplates as buildAdminWelcomeEmail,
  buildComplaintSubmittedTemplates as buildComplaintSubmittedEmail,
  buildComplaintStatusTemplates as buildComplaintStatusEmail,
} from "@/notifications/templates";
