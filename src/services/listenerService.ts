import axios from 'axios';
import type { ListenerRegistrationData } from '@/types/listenerRegistration';

const apiUrl = import.meta.env.VITE_API_URL;

const authConfig = () => {
  const dataOne = JSON.parse(localStorage.getItem('data') || 'null');

  return {
    headers: {
      Authorization: `Bearer ${dataOne?.accessToken || ''}`,
    },
  };
};

export async function getToken() {
  const response = await axios.get(`${apiUrl}/Token/getToken`);

  if (response.data?.status !== '1') {
    throw new Error(
      response.data?.msg || 'Unable to get login token.',
    );
  }

  return response.data;
}


export async function checkEmailPhone(input: {
  email?: string;
  phone_number?: string;
}) {
  const payload: {
    email?: string;
    phone_number?: string;
  } = {};

  if (input.email?.trim()) {
    payload.email = input.email.trim();
  }

  if (input.phone_number?.trim()) {
    payload.phone_number = input.phone_number.trim();
  }

  if (!payload.email && !payload.phone_number) {
    throw new Error("Email or mobile number is required.");
  }

  try {
    const response = await axios.post(
      `${apiUrl}/User/checkEmailPhone`,
      payload,
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.msg ||
        error?.response?.data?.message ||
        "Unable to check email or mobile number.",
    );
  }
}


export async function createListener(input: {
  contactMethod: "phone" | "email";
  contact: string;
  details?: Record<string, unknown>;
}) {
  const tokenResponse = await getToken();
  const token = tokenResponse?.data?.UserMobLoginToken;

  if (!token) {
    throw new Error(
      "UserMobLoginToken was not returned by Token API.",
    );
  }

  const payload: Record<string, unknown> = {
    token,
    ...(input.details || {}),
  };

  if (input.contactMethod === "phone") {
    payload.mobile_number = input.contact.trim();
  } else {
    payload.email = input.contact.trim();
  }

  try {
    const response = await axios.post(
      `${apiUrl}/Listener/create-listener`,
      payload,
    );

    const result = response.data;

    if (result?.status === "1" && result?.data) {
      localStorage.setItem("data", JSON.stringify(result.data));
    }

    return result;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.msg ||
        error?.response?.data?.message ||
        "Create listener API failed.",
    );
  }
}


export async function updateListener(
  listenerId: string,
  payload: Record<string, unknown>,
) {
  const response = await axios.put(
    `${apiUrl}/Listener/update-listener/${listenerId}`,
    payload,
    authConfig(),
  );

  return response.data;
}

export async function getStep1MasterData() {
  const response = await axios.get(
    `${apiUrl}/Language/getAllMasterDataStep1`,
  );

  const result = response.data;

  if (result?.status !== '1') {
    throw new Error(
      result?.msg || 'Unable to load Step 1 master data.',
    );
  }

  return result?.data || {};
}

export async function getCitiesByStateId(stateId: string) {
  const response = await axios.get(
    `${apiUrl}/Language/getCityByStateId/${stateId}`,
  );

  const result = response.data;

  if (result?.status !== '1') {
    throw new Error(
      result?.msg || 'Unable to load cities.',
    );
  }

  return result?.data || [];
}

export async function getStep2MasterData() {
  const response = await axios.get(
    `${apiUrl}/Language/getAllMasterDataStep2`,
  );

  const result = response.data;

  if (result?.status !== '1') {
    throw new Error(
      result?.msg || 'Unable to load Step 2 master data.',
    );
  }

  return result?.data || {};
}

export async function updateListenerPreference(
  listenerId: string,
  payload: {
    category: string;
    languages: string;
    relate_to: string;
  },
) {
  const response = await axios.put(
    `${apiUrl}/Listener/update-listener-preference/${listenerId}`,
    payload,
    authConfig(),
  );

  return response.data;
}
export async function updateListenerStory(
  listenerId: string,
  payload: {
    life_experiences: string;
    listening_style: string;
    join_reason: string;
  },
) {
  const response = await axios.put(
    `${apiUrl}/Listener/update-listener-story/${listenerId}`,
    payload,
    authConfig(),
  );

  return response.data;
}
export async function uploadListenerProfileImage(
  file: File,
) {
  const formData = new FormData();

  formData.append('image', file);

  const response = await axios.post(
    `${apiUrl}/User/addOneImgUrl`,
    formData,
  );

  const result = response.data;

  if (!result) {
    throw new Error(
      'Image upload failed.',
    );
  }
  const imageUrl =
    result?.images?.[0];

  if (!imageUrl) {
    throw new Error(
      'Image URL not received from upload API.',
    );
  }

  return imageUrl;
}

export async function uploadListenerAudioIntro(
  file: File,
) {
  const formData = new FormData();

  formData.append('image', file);

  const response = await axios.post(
    `${apiUrl}/User/addOneImgUrl`,
    formData,
  );

  const result = response.data;

  console.log(
    'Audio Upload Response:',
    result,
  );

  const audioUrl =
    result?.images?.[0];

  if (!audioUrl) {
    throw new Error(
      'Audio URL not received from upload API.',
    );
  }

  return audioUrl;
}
export async function updateListenerAvailabilityPricing(
  listenerId: string,
  payload: {
    chat_enabled: boolean;
    audio_call_enabled: boolean;
    video_call_enabled: boolean;
    available_for_sessions: boolean;
    weekly_schedule: Record<
      string,
      {
        type: string;
        start_time: string;
        end_time: string;
      }[]
    >;
    response_time_minutes: number;
  },
) {
  const response = await axios.put(
    `${apiUrl}/Listener/update-listener-availability-pricing/${listenerId}`,
    payload,
    authConfig(),
  );

  return response.data;
}
export async function updateListenerPricing(
  listenerId: string,
  payload: {
    chat_charge_per_minute: number;
    audio_charge_per_minute: number;
    video_charge_per_minute: number;
    intro_offer_enabled: boolean;
  },
) {
  const response = await axios.put(
    `${apiUrl}/Listener/update-listener-availability-pricing/${listenerId}`,
    payload,
    authConfig(),
  );

  return response.data;
}

export async function uploadListenerKycFile(
  file: File,
) {
  const formData = new FormData();

  formData.append('image', file);

  const response = await axios.post(
    `${apiUrl}/User/addOneImgUrl`,
    formData,
  );

  const result = response.data;

  console.log(
    'Image Upload Response:',
    result,
  );

  const fileUrl =
    result?.images?.[0];

  if (!fileUrl) {
    throw new Error(
      'Image URL was not returned from upload API.',
    );
  }

  return fileUrl;
}
export async function updateListenerKyc(
  listenerId: string,
  payload: {
    id_proof_file: string;
    pan_card_file: string;
    selfie_file: string;
    address_proof_file: string;
  },
) {
  const response = await axios.put(
    `${apiUrl}/Listener/update-listener-kyc/${listenerId}`,
    payload,
    authConfig(),
  );

  return response.data;
}

export async function updateListenerPayout(
  listenerId: string,
  payload: {
    account_holder_name: string;
    bank_name: string;
    account_number: string;
    confirm_account_number: string;
    ifsc_code: string;
    upi_id: string;
    payout_details_confirmed: boolean;
  },
) {
  const response = await axios.put(
    `${apiUrl}/Listener/update-listener-payout/${listenerId}`,
    payload,
    authConfig(),
  );

  return response.data;
}
/**
 * Existing registration function used by ListenerRegistration.tsx
 */
export async function registerListener(
  data: ListenerRegistrationData,
) {
  return createListener({
    contactMethod: data.contactMethod,
    contact: data.contact,
    details: { password: data.password },
  });
}