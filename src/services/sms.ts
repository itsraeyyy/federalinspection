import { sendSMS as serverSendSMS } from '@/lib/textbee';

export const smsService = {
  /**
   * Sends an SMS using the Textbee API via a Server Action.
   * @param to The recipient's phone number.
   * @param message The SMS message content.
   */
  sendSMS: async (to: string, message: string): Promise<boolean> => {
    try {
      if (!to || !message) return false;
      
      const result = await serverSendSMS(to, message);
      
      if (result.error) {
        console.warn(`[SMS Dispatch Warning] Could not send SMS to ${to}: ${result.error}`);
        return false;
      }

      console.log(`[SMS Sent] successfully to ${to}`);
      return true;
    } catch (error: any) {
      console.warn(`[SMS Dispatch Error] Error sending SMS to ${to}:`, error?.message || error);
      return false;
    }
  }
};
