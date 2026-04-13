// This handles the LinkedIn tracking functions

declare global {
  interface Window {
    lintrk?: (action: string, data?: Record<string, any>) => void;
    _linkedin_data_partner_ids?: string[];
  }
}

export const GET_STARTED_FOR_FREE_CONVERSION_ID = "22141156"; 
export const GET_DEMO_CONVERSION_ID = "22141164"; 
export const REGISTER_EMAIL_CONVERSION_ID = "22141172";
export const COMPLETE_REGISTRATION_CONVERSION_ID = "22141180";
// export const SUBSCRIBE_NEWSLETTER_CONVERSION_ID = "22141188";
export const CONTACT_SUBMISSION_CONVERSION_ID = "22141188";
export const DEMO_REGISTER_CONVERSION_ID = "22141196";

export const trackLinkedInConversion = (
  conversionId: string,
  userData?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    title?: string;
    countryCode?: string;
  }
) => {
  if (typeof window !== 'undefined' && window.lintrk) {
    const conversionData: Record<string, any> = {
      conversion_id: conversionId,
    };

    console.log("Tracking LinkedIn conversion with ID:", conversionId, userData);

    // Add user data if provided (hashed by LinkedIn automatically)
    if (userData) {
      if (userData.email) conversionData.email = userData.email;
      if (userData.firstName) conversionData.firstName = userData.firstName;
      if (userData.lastName) conversionData.lastName = userData.lastName;
      if (userData.companyName) conversionData.companyName = userData.companyName;
      if (userData.title) conversionData.title = userData.title;
      if (userData.countryCode) conversionData.countryCode = userData.countryCode;
    }

    window.lintrk('track', conversionData);
  }
};

