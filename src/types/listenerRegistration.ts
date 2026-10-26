export type ContactMethod = 'phone' | 'email';
export type RegistrationFile = File | null;

export type ListenerRegistrationData = {
  contactMethod: ContactMethod;
  contact: string;
  password: string;
  role: 'Listener' | 'Expert';
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  state: string;
  city: string;
  occupation: string;
  qualification: string;
  informationAccurate: boolean;
  agreedToTerms: boolean;
  categories: string[];
  languages: string[];
  relatableTopics: string[];
  lifeExperiences: string;
  listeningStyle: string;
  motivation: string;
  profilePhoto: RegistrationFile;
  audioIntro: RegistrationFile;
  services: {
    chat: boolean;
    call: boolean;
    videoCall: boolean;
    available: boolean;
  };
  schedule: Record<string, string[]>;
responsePreference: number;
 pricing: {
  chat: number;
  audio: number;
  video: number;
  introOffer: boolean;
};
  kyc: {
    identity: RegistrationFile;
    pan: RegistrationFile;
    selfie: RegistrationFile;
    address: RegistrationFile;
  };
  bank: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    confirmAccountNumber: string;
    ifsc: string;
    upi: string;
  };
};
