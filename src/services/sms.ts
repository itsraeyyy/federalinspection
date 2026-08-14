import { sendSMS } from "@/notifications";

export const smsService = {
  sendSMS: async (to: string, message: string) => {
    return await sendSMS(to, message);
  }
};
