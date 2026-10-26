import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileAudio2,
  FileImage,
  Heart,
  Info,
  LockKeyhole,
  Mic,
  Upload,
  X,
} from "lucide-react";

import { Link } from "wouter";

import {
  createListener,
  checkEmailPhone,
  registerListener,
  getStep1MasterData,
  getCitiesByStateId,
  updateListener,
  getStep2MasterData,
  updateListenerPreference,
  updateListenerStory,
  uploadListenerProfileImage,
  uploadListenerAudioIntro,
  updateListenerAvailabilityPricing,
  updateListenerPricing,
  uploadListenerKycFile,
  updateListenerKyc,
  updateListenerPayout,
} from "@/services/listenerService";

import type {
  ContactMethod,
  ListenerRegistrationData,
} from "@/types/listenerRegistration";
const logo = `${import.meta.env.BASE_URL}talkone_logo.png`;
import ".././logo.css";
// =========================================================
// CONSTANTS
// =========================================================

const steps = [
  "Basic Details",
  "Categories & Expertise",
  "Your Story",
  "Profile Photo",
  "Audio Introduction",
  "Availability",
  "Pricing",
  "KYC Verification",
  "Payment Information",
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const timeSlots = [
  "Morning 6 AM–12 PM",
  "Afternoon 12 PM–6 PM",
  "Evening 6 PM–12 AM",
  "Night 12 AM–6 AM",
];

// =========================================================
// INITIAL DATA
// =========================================================

function initialData(): ListenerRegistrationData {
  return {
    // Contact
    contactMethod: "phone",
    contact: "",
    password: "",

    // Basic
    role: "Listener",
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    state: "",
    city: "",
    occupation: "",
    qualification: "",
    informationAccurate: false,
    agreedToTerms: false,

    // Expertise
    categories: [],
    languages: [],
    relatableTopics: [],

    // Story
    lifeExperiences: "",
    listeningStyle: "",
    motivation: "",

    // Files
    profilePhoto: null,
    audioIntro: null,

    // Services
    services: {
      chat: false,
      call: false,
      videoCall: false,
      available: false,
    },

    // Schedule
    schedule: Object.fromEntries(weekdays.map((day) => [day, []])),

    responsePreference: 5,

    pricing: {
      chat: 0,
      audio: 0,
      video: 0,
      introOffer: false,
    },

    // KYC
    kyc: {
      identity: null,
      pan: null,
      selfie: null,
      address: null,
    },

    // Bank
    bank: {
      accountHolder: "",
      bankName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifsc: "",
      upi: "",
    },
  };
}

// =========================================================
// FIELD COMPONENT
// =========================================================

function Field({
  label,
  children,
  required = false,
  error,
  className = "",
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <div className={`reg-field ${className}`}>
      <label className="field-label">
        {label}

        {required && (
          <span className="required-mark" aria-label="required">
            {" "}
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// =========================================================
// TEXT INPUT
// =========================================================

function TextInput({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  error,
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  error?: string;
  [key: string]: unknown;
}) {
  return (
    <Field label={label} required={required} error={error}>
      <input
        className="field-input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
        aria-label={label}
        aria-invalid={Boolean(error)}
        data-testid={`input-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        {...(props as object)}
      />
    </Field>
  );
}

// =========================================================
// TEXT AREA
// =========================================================

function TextArea({
  label,
  value,
  onChange,
  required,
  placeholder,
  error,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder: string;
  error?: string;
  minLength?: number;
}) {
  return (
    <Field label={label} required={required} error={error}>
      <textarea
        className="field-input field-textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={Boolean(error)}
        minLength={minLength}
        data-testid={`input-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
      />
    </Field>
  );
}

// =========================================================
// CHOICE GROUP
// =========================================================

function ChoiceGroup({
  label,
  options,
  selected,
  onToggle,
  multiple = true,
  error,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  multiple?: boolean;
  error?: string;
}) {
  return (
    <div className="reg-field">
      <p className="field-label">
        {label} <span className="required-mark">*</span>
      </p>

      <div className="choice-grid" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            type="button"
            key={option}
            aria-pressed={selected.includes(option)}
            className={`choice-chip ${
              selected.includes(option) ? "selected" : ""
            }`}
            onClick={() => onToggle(option)}
            data-testid={`choice-${option
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")}`}
          >
            <span>{option}</span>

            {selected.includes(option) && <Check size={15} />}
          </button>
        ))}
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// =========================================================
// FILE PICKER
// =========================================================

function FilePicker({
  label,
  accept,
  file,
  onFile,
  capture,
  description,
  error,
  testId,
}: {
  label: string;
  accept: string;
  file: File | null;
  onFile: (file: File | null) => void;
  capture?: "user";
  description?: string;
  error?: string;
  testId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    onFile(event.target.files?.[0] ?? null);
  };

  return (
    <div className="upload-tile">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={capture}
        onChange={change}
        className="sr-only"
        aria-label={label}
        data-testid={testId}
      />

      <div className="upload-symbol">
        {previewUrl ? (
          <img src={previewUrl} alt={`Preview of ${label}`} />
        ) : file?.type.startsWith("audio/") ? (
          <FileAudio2 size={22} />
        ) : file ? (
          <FileImage size={22} />
        ) : (
          <Upload size={22} />
        )}
      </div>

      <div className="upload-copy">
        <strong>{label}</strong>

        {description && <span>{description}</span>}

        {file && (
          <span className="file-name">
            {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
          </span>
        )}
      </div>

      <button
        type="button"
        className="button button-outline upload-button"
        onClick={() => inputRef.current?.click()}
        data-testid={`${testId}-trigger`}
      >
        {file ? "Change file" : capture ? "Take / choose" : "Choose file"}
      </button>

      {file && (
        <button
          type="button"
          className="file-remove"
          aria-label={`Remove ${label}`}
          onClick={() => {
            onFile(null);

            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }}
          data-testid={`${testId}-remove`}
        >
          <X size={17} />
        </button>
      )}

      {error && (
        <p className="field-error upload-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function ListenerRegistration() {
  const [data, setData] = useState<ListenerRegistrationData>(initialData);

  const [stage, setStage] = useState(0);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [submitted, setSubmitted] = useState(false);

  // IMPORTANT:
  // Prevent double API request
  const [creatingListener, setCreatingListener] = useState(false);

  const [masterStep1, setMasterStep1] = useState<{
    states: Array<{ state_id: string | number; state_name: string }>;
    occupations: Array<{
      occupation_id: string;
      occupation_name?: string;
      name?: string;
    }>;
    qualifications: Array<{
      qualification_id: string;
      qualification_name?: string;
      name?: string;
    }>;
  }>({ states: [], occupations: [], qualifications: [] });

  const [cities, setCities] = useState<
    Array<{ city_id: string | number; city_name: string }>
  >([]);

  const [masterStep2, setMasterStep2] = useState<{
    categories: Array<{ category_id: string; category_name: string }>;
    languages: Array<{ language_id: string; name: string }>;
    relatedTo: Array<{ related_to_id: string; related_to_name: string }>;
  }>({ categories: [], languages: [], relatedTo: [] });

  const [masterLoading, setMasterLoading] = useState(false);

  const [recording, setRecording] = useState(false);

  const [recordingSeconds, setRecordingSeconds] = useState(30);

  const [recordingError, setRecordingError] = useState("");

  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const chunks = useRef<Blob[]>([]);

  const recordingTimeout = useRef<number | null>(null);

  const recordingInterval = useRef<number | null>(null);

  const pendingAudioUrl = useRef<string | null>(null);

  // =========================================================
  // CLEAR RECORDING TIMERS
  // =========================================================

  const clearRecordingTimers = () => {
    if (recordingTimeout.current !== null) {
      window.clearTimeout(recordingTimeout.current);
    }

    if (recordingInterval.current !== null) {
      window.clearInterval(recordingInterval.current);
    }

    recordingTimeout.current = null;
    recordingInterval.current = null;
  };

  // =========================================================
  // PAGE TITLE
  // =========================================================

  useEffect(() => {
    document.title = "Listener Registration — TalkOne";

    const description = "TalkOne listener registration.";

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
  }, []);

  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(
    () => () => {
      clearRecordingTimers();

      if (pendingAudioUrl.current) {
        URL.revokeObjectURL(pendingAudioUrl.current);
      }

      const recorder = mediaRecorder.current;

      if (recorder) {
        recorder.onstop = null;

        if (recorder.state !== "inactive") {
          recorder.stop();
        }

        recorder.stream.getTracks().forEach((track) => track.stop());
      }
    },
    [],
  );

  // =========================================================
  // MASTER DATA
  // =========================================================

  const loadStep1MasterData = async () => {
    try {
      setMasterLoading(true);
      const response = await getStep1MasterData();
      setMasterStep1({
        states: response?.states || response?.state || [],
        occupations: response?.occupations || response?.occupation || [],
        qualifications:
          response?.qualifications || response?.qualification || [],
      });
    } catch (error) {
      console.error("Step 1 master data error:", error);
    } finally {
      setMasterLoading(false);
    }
  };

  const loadCities = async (stateId: string) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    try {
      setMasterLoading(true);
      const response = await getCitiesByStateId(stateId);
      setCities(response || []);
    } catch (error) {
      console.error("City data error:", error);
      setCities([]);
    } finally {
      setMasterLoading(false);
    }
  };

  const loadStep2MasterData = async () => {
    try {
      setMasterLoading(true);
      const response = await getStep2MasterData();
      setMasterStep2({
        categories: response?.categories || [],
        languages: response?.languages || [],
        relatedTo: response?.relatedTo || response?.related_to || [],
      });
    } catch (error) {
      console.error("Step 2 master data error:", error);
    } finally {
      setMasterLoading(false);
    }
  };

  useEffect(() => {
    loadStep1MasterData();
    loadStep2MasterData();
  }, []);

  // =========================================================
  // UPDATE DATA
  // =========================================================

  const update = <K extends keyof ListenerRegistrationData>(
    key: K,
    value: ListenerRegistrationData[K],
  ) => {
    setData((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // =========================================================
  // TOGGLE LIST
  // =========================================================

  const toggleList = (
    key: "categories" | "languages" | "relatableTopics",
    value: string,
    single = false,
  ) => {
    const current = data[key];

    update(
      key,
      single
        ? current.includes(value)
          ? []
          : [value]
        : current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
    );

    setErrors((old) => ({
      ...old,
      [key]: "",
    }));
  };

  // =========================================================
  // CONTACT VALIDATION + API
  // =========================================================

  const validateContact = async () => {
    const contact = data.contact.trim();
    const newErrors: Record<string, string> = {};

    if (!contact) {
      newErrors.contact =
        data.contactMethod === "email"
          ? "Email is required"
          : "Mobile number is required";
    }

    if (data.contactMethod === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
        newErrors.contact = "Please enter a valid email address";
      }
    } else if (!/^\+?\d{7,15}$/.test(contact.replace(/[\s().-]/g, ""))) {
      newErrors.contact = "Enter a valid phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    try {
      setCreatingListener(true);

      const response = await checkEmailPhone(
        data.contactMethod === "email"
          ? { email: contact }
          : { phone_number: contact },
      );

      if (response?.status !== "1") {
        setErrors({
          contact:
            response?.msg ||
            "This email or mobile number is already registered.",
        });
        return false;
      }

      setData((previous) => ({
        ...previous,
        phone: data.contactMethod === "phone" ? contact : previous.phone,
        contact,
      }));

      setErrors({});
      setStage(1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return true;
    } catch (error) {
      setErrors({
        contact:
          error instanceof Error
            ? error.message
            : "Unable to check email or mobile number.",
      });

      return false;
    } finally {
      setCreatingListener(false);
    }
  };

  // =========================================================
  // VALIDATE OTHER STEPS
  // =========================================================

  const validateStep = () => {
    const next: Record<string, string> = {};

    if (stage === 1) {
      if (!data.fullName.trim()) {
        next.fullName = "Enter your full legal name.";
      }

      if (
        data.contactMethod === "phone" &&
        (!data.phone.trim() || !/^[+\d][\d\s().-]{6,19}$/.test(data.phone))
      ) {
        next.phone = "Enter a valid phone number.";
      }

      if (!data.dateOfBirth) {
        next.dateOfBirth = "Choose your date of birth.";
      }

      if (!data.gender) {
        next.gender = "Choose a gender.";
      }

      if (!data.state.trim()) {
        next.state = "Enter your state.";
      }

      if (!data.city.trim()) {
        next.city = "Enter your city.";
      }

      if (!data.occupation.trim()) {
        next.occupation = "Enter your occupation.";
      }

      if (!data.qualification) {
        next.qualification = "Choose your highest qualification.";
      }

      if (!data.informationAccurate) {
        next.informationAccurate = "Confirm that your information is accurate.";
      }

      if (!data.agreedToTerms) {
        next.agreedToTerms = "You must agree to continue.";
      }
    }

    if (stage === 2) {
      if (!data.categories.length) {
        next.categories = "Select at least one topic.";
      }

      if (!data.languages.length) {
        next.languages = "Select at least one language.";
      }

      if (!data.relatableTopics.length) {
        next.relatableTopics = "Choose at least one topic you relate to.";
      }
    }

    if (stage === 3) {
      if (data.lifeExperiences.trim().length < 20) {
        next.lifeExperiences = "Please share at least 20 characters.";
      }

      if (data.listeningStyle.trim().length < 5) {
        next.listeningStyle = "Please describe your listening style.";
      }

      if (data.motivation.trim().length < 10) {
        next.motivation = "Please tell us a little more about your motivation.";
      }
    }

    if (stage === 4 && !data.profilePhoto) {
      next.profilePhoto = "Add a profile photo to continue.";
    }

    if (stage === 5 && !data.audioIntro) {
      next.audioIntro = "Upload or record your audio introduction.";
    }

    if (stage === 6 && !data.services.available) {
      next.services = "Turn on availability for sessions.";
    }

    if (stage === 8) {
      if (!data.kyc.identity) {
        next.identity = "Upload an Aadhaar or valid photo ID front.";
      }

      if (!data.kyc.pan) {
        next.pan = "Upload a PAN card.";
      }

      if (!data.kyc.selfie) {
        next.selfie = "Add a selfie or live photo.";
      }

      if (!data.kyc.address) {
        next.address = "Upload recent address proof.";
      }
    }

    if (stage === 9) {
      const bank = data.bank;

      if (!bank.accountHolder.trim()) {
        next.accountHolder = "Enter the account holder name.";
      }

      if (!bank.bankName.trim()) {
        next.bankName = "Enter the bank name.";
      }

      if (!/^\d{8,18}$/.test(bank.accountNumber)) {
        next.accountNumber = "Enter an account number between 8 and 18 digits.";
      }

      if (bank.confirmAccountNumber !== bank.accountNumber) {
        next.confirmAccountNumber = "Account numbers do not match.";
      }

      if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(bank.ifsc)) {
        next.ifsc = "Enter a valid IFSC code.";
      }
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  // =========================================================
  // CONTINUE OTHER STEPS
  // =========================================================

  const continueStep = async () => {
    // =====================================================
    // STEP 1 - BASIC DETAILS
    // =====================================================

    if (stage === 1) {
      const isValid = validateStep();

      if (!isValid) {
        console.log("STEP 1 VALIDATION ERRORS:", errors);
        return;
      }
      try {
        setCreatingListener(true);

        const payload = {
          mobile_number: data.phone.trim(),
          name: data.fullName.trim(),
          email: data.contactMethod === "email" ? data.contact.trim() : null,
          password:
            data.contactMethod === "email" ? data.password.trim() : undefined,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          state: data.state,
          city: data.city,
          occupation: data.occupation.trim(),
          highest_qualification: data.qualification,
          role: data.role === "Listener" ? "1" : "2",
        };

        // Create the listener only after Step 1 is completed.
        const response = await createListener({
          contactMethod: data.contactMethod,
          contact: data.contact.trim(),
          details: payload,
        });

        if (response?.status !== "1") {
          setErrors({
            form: response?.msg || "Unable to create listener account.",
          });
          return;
        }

        setErrors({});
        setStage(2);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      } catch (error) {
        console.error("STEP 1 CREATE LISTENER ERROR:", error);

        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "Unable to create listener account.",
        });

        return;
      } finally {
        setCreatingListener(false);
      }
    }

    // =====================================================
    // STEP 2 - LISTENER PREFERENCE
    // =====================================================

    if (stage === 2) {
      const isValid = validateStep();

      if (!isValid) {
        return;
      }

      try {
        const dataOne = JSON.parse(localStorage.getItem("data") || "null");

        const listenerId = dataOne?.listener_id;

        if (!listenerId) {
          console.error("listener_id not found:", dataOne);

          setErrors({
            form: "Listener ID not found. Please restart registration.",
          });

          return;
        }

        // -----------------------------------------------
        // CATEGORY
        // -----------------------------------------------

        const categoryIds = Array.isArray(data.categories)
          ? data.categories
          : [];

        // -----------------------------------------------
        // LANGUAGES
        // -----------------------------------------------

        const languageIds = Array.isArray(data.languages) ? data.languages : [];

        // -----------------------------------------------
        // RELATED TO
        // -----------------------------------------------

        const relatedToIds = Array.isArray(data.relatableTopics)
          ? data.relatableTopics
          : [];

        // -----------------------------------------------
        // API PAYLOAD
        // -----------------------------------------------

        const payload = {
          category: `[${categoryIds.join(",")}]`,

          languages: `[${languageIds.join(",")}]`,

          relate_to: `[${relatedToIds.join(",")}]`,
        };

        console.log("STEP 2 LISTENER ID:", listenerId);

        console.log("STEP 2 PREFERENCE PAYLOAD:", payload);

        // -----------------------------------------------
        // UPDATE PREFERENCE API
        // -----------------------------------------------

        const response = await updateListenerPreference(listenerId, payload);

        console.log("STEP 2 PREFERENCE RESPONSE:", response);

        // -----------------------------------------------
        // API SUCCESS
        // -----------------------------------------------

        if (response?.status !== "1") {
          setErrors({
            form: response?.msg || "Unable to save preferences.",
          });

          return;
        }

        // -----------------------------------------------
        // GO TO STEP 3
        // -----------------------------------------------

        setErrors({});

        setStage(3);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      } catch (error: any) {
        console.error("STEP 2 PREFERENCE ERROR:", error);

        console.error(
          "STEP 2 PREFERENCE ERROR RESPONSE:",
          error?.response?.data,
        );

        setErrors({
          form:
            error?.response?.data?.msg ||
            error?.message ||
            "Unable to save preferences.",
        });

        return;
      }
    }

    // =====================================================
    // STEP 3 - LISTENER STORY
    // =====================================================

    if (stage === 3) {
      const isValid = validateStep();

      if (!isValid) {
        return;
      }

      try {
        const dataOne = JSON.parse(localStorage.getItem("data") || "null");

        const listenerId = dataOne?.listener_id;

        if (!listenerId) {
          console.error("listener_id not found:", dataOne);

          setErrors({
            form: "Listener ID not found. Please restart registration.",
          });

          return;
        }

        const payload = {
          life_experiences: data.lifeExperiences.trim(),

          listening_style: data.listeningStyle.trim(),

          join_reason: data.motivation.trim(),
        };

        console.log("STEP 3 LISTENER ID:", listenerId);

        console.log("STEP 3 STORY PAYLOAD:", payload);

        // -----------------------------------------------
        // UPDATE STORY API
        // -----------------------------------------------

        const response = await updateListenerStory(listenerId, payload);

        console.log("STEP 3 STORY RESPONSE:", response);

        // -----------------------------------------------
        // API SUCCESS
        // -----------------------------------------------

        if (response?.status !== "1") {
          setErrors({
            form: response?.msg || "Unable to save your story.",
          });

          return;
        }

        // -----------------------------------------------
        // GO TO STEP 4
        // -----------------------------------------------

        setErrors({});

        setStage(4);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      } catch (error: any) {
        console.error("STEP 3 STORY ERROR:", error);

        console.error("STEP 3 STORY ERROR RESPONSE:", error?.response?.data);

        setErrors({
          form:
            error?.response?.data?.msg ||
            error?.message ||
            "Unable to save your story.",
        });

        return;
      }
    }

    // =====================================================
    // STEP 4 - PROFILE IMAGE
    // =====================================================

    if (stage === 4) {
      const isValid = validateStep();

      if (!isValid) {
        return;
      }

      try {
        const dataOne = JSON.parse(localStorage.getItem("data") || "null");

        const listenerId = dataOne?.listener_id;

        if (!listenerId) {
          setErrors({
            form: "Listener ID not found. Please restart registration.",
          });

          return;
        }

        // ================================================
        // CHECK IMAGE
        // ================================================

        if (!data.profilePhoto) {
          setErrors({
            form: "Please select a profile image.",
          });

          return;
        }

        console.log("STEP 4 PROFILE IMAGE:", data.profilePhoto);

        // ================================================
        // 1. UPLOAD IMAGE
        // ================================================

        const imageUrl = await uploadListenerProfileImage(data.profilePhoto);

        console.log("STEP 4 UPLOADED IMAGE URL:", imageUrl);

        // ================================================
        // 2. UPDATE LISTENER PROFILE
        // ================================================

        const response = await updateListener(listenerId, {
          listenerProfile: imageUrl,
        });

        console.log("STEP 4 UPDATE LISTENER RESPONSE:", response);

        // ================================================
        // API SUCCESS
        // ================================================

        if (response?.status !== "1") {
          setErrors({
            form: response?.msg || "Unable to save profile image.",
          });

          return;
        }

        // ================================================
        // GO TO STEP 5
        // ================================================

        setErrors({});

        setStage(5);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      } catch (error: any) {
        console.error("STEP 4 PROFILE IMAGE ERROR:", error);

        console.error("STEP 4 ERROR RESPONSE:", error?.response?.data);

        setErrors({
          form:
            error?.response?.data?.msg ||
            error?.message ||
            "Unable to upload profile image.",
        });

        return;
      }
    }

    // =========================================================
    // STEP 5 - AUDIO INTRO
    // =========================================================

    if (stage === 5) {
      if (!data.audioIntro) {
        setErrors({
          form: "Please record your audio introduction.",
        });

        return;
      }

      /*
       * Audio upload + listener update already happens
       * when recording is stopped/closed.
       *
       * Here we only move to the next stage after
       * audioIntro exists.
       */

      console.log("STEP 5 AUDIO:", data.audioIntro);

      setErrors({});

      setStage(6);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }
    // =========================================================
    // STEP 6 - AVAILABILITY & PRICING
    // =========================================================

    if (stage === 6) {
      try {
        const dataOne = JSON.parse(localStorage.getItem("data") || "null");

        const listenerId = dataOne?.listener_id;

        if (!listenerId) {
          setErrors({
            form: "Listener ID not found. Please restart registration.",
          });

          return;
        }

        // =====================================================
        // CONVERT UI SCHEDULE TO API SCHEDULE
        // =====================================================

        const convertSchedule = (items: string[] = []) => {
          return items
            .map((item) => {
              // Morning 6 AM–12 PM
              if (item.includes("Morning")) {
                return {
                  type: "Morning",
                  start_time: "06:00",
                  end_time: "12:00",
                };
              }

              // Afternoon 12 PM–6 PM
              if (item.includes("Afternoon")) {
                return {
                  type: "Afternoon",
                  start_time: "12:00",
                  end_time: "18:00",
                };
              }

              // Evening 6 PM–12 AM
              if (item.includes("Evening")) {
                return {
                  type: "Evening",
                  start_time: "18:00",
                  end_time: "00:00",
                };
              }

              // Night 12 AM–6 AM
              if (item.includes("Night")) {
                return {
                  type: "Night",
                  start_time: "00:00",
                  end_time: "06:00",
                };
              }

              return null;
            })
            .filter((slot) => slot !== null);
        };

        // =====================================================
        // WEEK DAYS
        // =====================================================

        const weeklySchedule = {
          Monday: convertSchedule(
            data.schedule?.Monday || data.schedule?.Mon || [],
          ),

          Tuesday: convertSchedule(
            data.schedule?.Tuesday || data.schedule?.Tue || [],
          ),

          Wednesday: convertSchedule(
            data.schedule?.Wednesday || data.schedule?.Wed || [],
          ),

          Thursday: convertSchedule(
            data.schedule?.Thursday || data.schedule?.Thu || [],
          ),

          Friday: convertSchedule(
            data.schedule?.Friday || data.schedule?.Fri || [],
          ),

          Saturday: convertSchedule(
            data.schedule?.Saturday || data.schedule?.Sat || [],
          ),

          Sunday: convertSchedule(
            data.schedule?.Sunday || data.schedule?.Sun || [],
          ),
        };

        // =====================================================
        // FINAL API PAYLOAD
        // =====================================================

        const payload = {
          chat_enabled: Boolean(data.services?.chat),

          audio_call_enabled: Boolean(data.services?.call),

          video_call_enabled: Boolean(data.services?.videoCall),

          available_for_sessions: Boolean(data.services?.available),

          weekly_schedule: weeklySchedule,

          response_time_minutes: data.responsePreference,
        };

        console.log("FINAL STEP 6 PAYLOAD:", JSON.stringify(payload, null, 2));

        // =====================================================
        // API CALL
        // =====================================================

        const response = await updateListenerAvailabilityPricing(
          listenerId,
          payload,
        );

        console.log("STEP 6 API RESPONSE:", response);

        if (response?.status !== "1") {
          setErrors({
            form: response?.msg || "Unable to save availability and pricing.",
          });

          return;
        }

        setErrors({});

        setStage(7);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      } catch (error: any) {
        console.error("STEP 6 ERROR:", error);

        console.error("STEP 6 API ERROR:", error?.response?.data);

        setErrors({
          form:
            error?.response?.data?.msg ||
            error?.message ||
            "Unable to save availability and pricing.",
        });

        return;
      }
    }
    // =====================================================
    // STEP 7 - PRICING
    // =====================================================

    if (stage === 7) {
      try {
        const dataOne = JSON.parse(localStorage.getItem("data") || "null");

        const listenerId = dataOne?.listener_id;

        if (!listenerId) {
          setErrors({
            form: "Listener ID not found. Please restart registration.",
          });

          return;
        }

        // ============================================
        // VALIDATION
        // ============================================

        if (!data.pricing.chat || data.pricing.chat <= 0) {
          setErrors({
            form: "Please enter a valid chat charge.",
          });

          return;
        }

        if (!data.pricing.audio || data.pricing.audio <= 0) {
          setErrors({
            form: "Please enter a valid audio call charge.",
          });

          return;
        }

        if (!data.pricing.video || data.pricing.video <= 0) {
          setErrors({
            form: "Please enter a valid video call charge.",
          });

          return;
        }

        // ============================================
        // API PAYLOAD
        // ============================================

        const payload = {
          chat_charge_per_minute: Number(data.pricing.chat),

          audio_charge_per_minute: Number(data.pricing.audio),

          video_charge_per_minute: Number(data.pricing.video),

          intro_offer_enabled: Boolean(data.pricing.introOffer),
        };

        console.log("STEP 7 PRICING PAYLOAD:", payload);

        // ============================================
        // API CALL
        // ============================================

        const response = await updateListenerPricing(
          listenerId,
          payload as any,
        );

        console.log("STEP 7 PRICING RESPONSE:", response);

        if (response?.status !== "1") {
          setErrors({
            form: response?.msg || "Unable to save pricing.",
          });

          return;
        }

        // ============================================
        // SUCCESS
        // ============================================

        setErrors({});

        setStage(8);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      } catch (error: any) {
        console.error("STEP 7 PRICING ERROR:", error);

        console.error("STEP 7 API ERROR:", error?.response?.data);

        setErrors({
          form:
            error?.response?.data?.msg ||
            error?.message ||
            "Unable to save pricing.",
        });

        return;
      }
    }

    // =========================================================
    // STEP 8 - KYC DOCUMENTS
    // =========================================================

    if (stage === 8) {
      try {
        const dataOne = JSON.parse(localStorage.getItem("data") || "null");

        const listenerId = dataOne?.listener_id;

        if (!listenerId) {
          setErrors({
            form: "Listener ID not found. Please restart registration.",
          });

          return;
        }

        // =====================================================
        // VALIDATION
        // =====================================================

        if (!data.kyc?.identity) {
          setErrors({
            form: "Please upload identity proof.",
          });

          return;
        }

        if (!data.kyc?.pan) {
          setErrors({
            form: "Please upload PAN card.",
          });

          return;
        }

        if (!data.kyc?.selfie) {
          setErrors({
            form: "Please upload selfie.",
          });

          return;
        }

        if (!data.kyc?.address) {
          setErrors({
            form: "Please upload address proof.",
          });

          return;
        }

        // =====================================================
        // UPLOAD ID PROOF
        // =====================================================

        const idProofUrl = await uploadListenerKycFile(data.kyc.identity);

        console.log("ID PROOF URL:", idProofUrl);

        // =====================================================
        // UPLOAD PAN
        // =====================================================

        const panCardUrl = await uploadListenerKycFile(data.kyc.pan);

        console.log("PAN URL:", panCardUrl);

        // =====================================================
        // UPLOAD SELFIE
        // =====================================================

        const selfieUrl = await uploadListenerKycFile(data.kyc.selfie);

        console.log("SELFIE URL:", selfieUrl);

        // =====================================================
        // UPLOAD ADDRESS PROOF
        // =====================================================

        const addressProofUrl = await uploadListenerKycFile(data.kyc.address);

        console.log("ADDRESS PROOF URL:", addressProofUrl);

        // =====================================================
        // KYC UPDATE PAYLOAD
        // =====================================================

        const payload = {
          id_proof_file: idProofUrl,
          pan_card_file: panCardUrl,
          selfie_file: selfieUrl,
          address_proof_file: addressProofUrl,
        };

        console.log("STEP 8 KYC PAYLOAD:", payload);

        // =====================================================
        // UPDATE KYC API
        // =====================================================

        const response = await updateListenerKyc(listenerId, payload);

        console.log("STEP 8 KYC RESPONSE:", response);

        if (response?.status !== "1") {
          setErrors({
            form: response?.msg || "Unable to save KYC documents.",
          });

          return;
        }

        // =====================================================
        // SUCCESS
        // =====================================================

        setErrors({});

        setStage(9);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      } catch (error: any) {
        console.error("STEP 8 KYC ERROR:", error);

        console.error("STEP 8 API ERROR:", error?.response?.data);

        setErrors({
          form:
            error?.response?.data?.msg ||
            error?.message ||
            "Unable to upload KYC documents.",
        });

        return;
      }
    }

    // =========================================================
    // STEP 9 - PAYOUT DETAILS
    // =========================================================

    if (stage === 9) {
      try {
        const dataOne = JSON.parse(localStorage.getItem("data") || "null");

        const listenerId = dataOne?.listener_id;

        if (!listenerId) {
          setErrors({
            form: "Listener ID not found. Please restart registration.",
          });

          return;
        }

        // =====================================================
        // VALIDATION
        // =====================================================

        if (!data.bank?.accountHolder?.trim()) {
          setErrors({
            form: "Please enter account holder name.",
          });

          return;
        }

        if (!data.bank?.bankName?.trim()) {
          setErrors({
            form: "Please enter bank name.",
          });

          return;
        }

        if (!data.bank?.accountNumber?.trim()) {
          setErrors({
            form: "Please enter account number.",
          });

          return;
        }

        if (!data.bank?.confirmAccountNumber?.trim()) {
          setErrors({
            form: "Please confirm account number.",
          });

          return;
        }

        // Account number match
        if (data.bank.accountNumber !== data.bank.confirmAccountNumber) {
          setErrors({
            form: "Account number and confirm account number do not match.",
          });

          return;
        }

        if (!data.bank?.ifsc?.trim()) {
          setErrors({
            form: "Please enter IFSC code.",
          });

          return;
        }

        if (!data.bank?.upi?.trim()) {
          setErrors({
            form: "Please enter UPI ID.",
          });

          return;
        }

        // =====================================================
        // PAYLOAD
        // =====================================================

        const payload = {
          account_holder_name: data.bank.accountHolder.trim(),

          bank_name: data.bank.bankName.trim(),

          account_number: data.bank.accountNumber.trim(),

          confirm_account_number: data.bank.confirmAccountNumber.trim(),

          ifsc_code: data.bank.ifsc.trim(),

          upi_id: data.bank.upi.trim(),

          // All details are filled and validated
          payout_details_confirmed: true,
        };

        console.log("STEP 9 PAYOUT PAYLOAD:", payload);

        // =====================================================
        // UPDATE PAYOUT API
        // =====================================================

        const response = await updateListenerPayout(listenerId, payload);

        console.log("STEP 9 PAYOUT RESPONSE:", response);

        if (response?.status !== "1") {
          setErrors({
            form: response?.msg || "Unable to save payout details.",
          });

          return;
        }

        // =====================================================
        // SUCCESS
        // =====================================================

        setErrors({});

        // Registration complete
        setStage(10);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      } catch (error: any) {
        console.error("STEP 9 PAYOUT ERROR:", error);

        console.error("STEP 9 API ERROR:", error?.response?.data);

        setErrors({
          form:
            error?.response?.data?.msg ||
            error?.message ||
            "Unable to save payout details.",
        });

        return;
      }
    }

    // =====================================================
    // FINAL STEP
    // =====================================================

    if (stage === 9) {
      if (!validateStep()) {
        return;
      }

      try {
        await registerListener(data);

        setSubmitted(true);
        setStage(10);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (error) {
        console.error("Final registration error:", error);
      }

      return;
    }

    // =====================================================
    // OTHER STEPS
    // =====================================================

    if (!validateStep()) {
      return;
    }

    setStage((current) => current + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // SCHEDULE
  // =========================================================

  const toggleSchedule = (day: string, slot: string) =>
    setData((old) => {
      const selected = old.schedule[day] ?? [];

      return {
        ...old,
        schedule: {
          ...old.schedule,
          [day]: selected.includes(slot)
            ? selected.filter((item) => item !== slot)
            : [...selected, slot],
        },
      };
    });

  // =========================================================
  // START RECORDING
  // =========================================================

  const startRecording = async () => {
    setRecordingError("");

    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);

      mediaRecorder.current = recorder;

      chunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size) {
          chunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const clip = new File(chunks.current, "talkone-introduction.webm", {
            type: recorder.mimeType || "audio/webm",
          });

          // Existing state update
          update("audioIntro", clip);

          // =========================================
          // GET LISTENER ID
          // =========================================

          const dataOne = JSON.parse(localStorage.getItem("data") || "null");

          const listenerId = dataOne?.listener_id;

          if (!listenerId) {
            throw new Error("Listener ID not found.");
          }

          // =========================================
          // UPLOAD AUDIO
          // =========================================

          console.log("Uploading listener audio...");

          const audioUrl = await uploadListenerAudioIntro(clip);

          console.log("Uploaded Audio URL:", audioUrl);

          // =========================================
          // UPDATE LISTENER
          // =========================================

          const response = await updateListener(listenerId, {
            listenerAudioIntro: audioUrl,
          });

          console.log("Listener Audio Update Response:", response);

          if (response?.status !== "1") {
            throw new Error(
              response?.msg || "Unable to save audio introduction.",
            );
          }

          console.log("Listener audio saved successfully.");
        } catch (error: any) {
          console.error("Listener audio upload/update error:", error);

          console.error("API Error:", error?.response?.data);

          setRecordingError(
            error?.response?.data?.msg ||
              error?.message ||
              "Unable to save audio introduction.",
          );
        } finally {
          // Existing microphone cleanup
          recorder.stream.getTracks().forEach((track) => track.stop());
        }
      };

      recorder.start();

      setRecording(true);

      setRecordingSeconds(30);

      recordingInterval.current = window.setInterval(
        () => setRecordingSeconds((seconds) => Math.max(0, seconds - 1)),
        1000,
      );

      recordingTimeout.current = window.setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }

        setRecording(false);

        setRecordingSeconds(0);

        setRecordingError("Recording stopped at the 30-second limit.");

        clearRecordingTimers();
      }, 30_000);
    } catch {
      stream?.getTracks().forEach((track) => track.stop());

      setRecordingError(
        "Microphone access is unavailable. You can upload an audio file instead.",
      );
    }
  };

  // =========================================================
  // STOP RECORDING
  // =========================================================

  const stopRecording = () => {
    clearRecordingTimers();

    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
    }

    setRecording(false);
  };

  // =========================================================
  // AUDIO FILE
  // =========================================================

  const chooseAudioFile = async (file: File | null) => {
    if (!file) {
      update("audioIntro", null);
      return;
    }
    try {
      update("audioIntro", file);

      // =========================================
      // GET LISTENER ID
      // =========================================

      const dataOne = JSON.parse(localStorage.getItem("data") || "null");

      const listenerId = dataOne?.listener_id;

      if (!listenerId) {
        throw new Error("Listener ID not found.");
      }

      // =========================================
      // UPLOAD AUDIO FILE
      // =========================================

      console.log("Uploading selected audio file...", file);

      const audioUrl = await uploadListenerAudioIntro(file);

      console.log("Uploaded Audio URL:", audioUrl);

      // =========================================
      // UPDATE LISTENER
      // =========================================

      const response = await updateListener(listenerId, {
        listenerAudioIntro: audioUrl,
      });

      console.log("Audio Update Response:", response);

      if (response?.status !== "1") {
        throw new Error(response?.msg || "Unable to save audio introduction.");
      }

      console.log("Uploaded audio saved successfully.");

      setRecordingError("");
    } catch (error: any) {
      console.error("Audio file upload/update error:", error);

      console.error("API Error:", error?.response?.data);

      setRecordingError(
        error?.response?.data?.msg ||
          error?.message ||
          "Unable to save audio introduction.",
      );
    }
  };

  // =========================================================
  // CONTACT PAGE
  // =========================================================

  const renderContact = () => (
    <form
      className="form-card registration-form"
      onSubmit={async (event) => {
        event.preventDefault();

        if (creatingListener) {
          return;
        }

        await validateContact();
      }}
      noValidate
    >
      <span className="eyebrow">First, how can we reach you?</span>

      <h2>Choose a contact method</h2>

      <p className="form-subtitle">
        Create your TalkOne listener account using your mobile number or email.
      </p>

      {/* ================================================= */}
      {/* PHONE / EMAIL TABS */}
      {/* ================================================= */}

      <div
        className="method-tabs"
        role="tablist"
        aria-label="Choose contact method"
      >
        {(["phone", "email"] as ContactMethod[]).map((method) => (
          <button
            key={method}
            type="button"
            role="tab"
            aria-selected={data.contactMethod === method}
            className="method-tab"
            disabled={creatingListener}
            onClick={() => {
              update("contactMethod", method);

              update("contact", "");

              update("password", "");

              setErrors({});
            }}
            data-testid={`tab-${method}`}
          >
            {method === "phone" ? "Mobile number" : "Email address"}
          </button>
        ))}
      </div>

      {/* ================================================= */}
      {/* MOBILE / EMAIL */}
      {/* ================================================= */}

      <Field
        label={
          data.contactMethod === "phone" ? "Mobile number" : "Email address"
        }
        required
        error={errors.contact}
      >
        <input
          className="field-input"
          type={data.contactMethod === "phone" ? "tel" : "email"}
          value={data.contact}
          onChange={(event) => {
            update("contact", event.target.value);

            if (errors.contact) {
              setErrors((old) => ({
                ...old,
                contact: "",
              }));
            }
          }}
          placeholder={
            data.contactMethod === "phone" ? "98765 43210" : "you@example.com"
          }
          autoComplete={data.contactMethod === "phone" ? "tel" : "email"}
          aria-invalid={Boolean(errors.contact)}
          data-testid={`input-contact-${data.contactMethod}`}
          disabled={creatingListener}
        />
      </Field>

      {/* ================================================= */}
      {/* PRIVACY */}
      {/* ================================================= */}

      <p className="privacy-note">
        <LockKeyhole size={16} />
        Your contact details are used to create your listener account.
      </p>

      {/* ================================================= */}
      {/* SUBMIT */}
      {/* ================================================= */}

      <button
        className="button button-dark form-submit"
        type="submit"
        disabled={creatingListener}
        data-testid="button-contact-continue"
      >
        {creatingListener ? (
          "Checking..."
        ) : (
          <>
            Continue
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );

  // =========================================================
  // OTHER STEPS
  // =========================================================

  const renderStep = () => {
    switch (stage) {
      // =====================================================
      // STEP 1
      // =====================================================

      case 1:
        return (
          <>
            <div
              className="role-options"
              role="radiogroup"
              aria-label="Choose role"
            >
              {(["Listener", "Expert"] as const).map((role) => (
                <button
                  type="button"
                  key={role}
                  className={`role-option ${
                    data.role === role ? "selected" : ""
                  }`}
                  aria-pressed={data.role === role}
                  onClick={() => update("role", role)}
                  data-testid={`role-${role.toLowerCase()}`}
                >
                  <span className="radio-dot" />
                  Join as {role}
                </button>
              ))}
            </div>

            <TextInput
              label="Full legal name"
              value={data.fullName}
              onChange={(value) => update("fullName", value)}
              required
              error={errors.fullName}
              autoComplete="name"
            />

            <TextInput
              label="Phone number"
              type="tel"
              value={data.phone}
              onChange={(value) => update("phone", value)}
              required
              error={errors.phone}
              autoComplete="tel"
            />
            {data.contactMethod === "email" && (
              <TextInput
                label="Email address"
                type="email"
                value={data.contact}
                onChange={(value) => update("contact", value)}
                required
                error={errors.contact}
                autoComplete="email"
                readOnly
              />
            )}
            {data.contactMethod === "email" && (
              <TextInput
                label="Password"
                type="password"
                value={data.password}
                onChange={(value) => update("password", value)}
                required
                error={errors.password}
                autoComplete="new-password"
              />
            )}
            <div className="reg-columns">
              <Field label="Date of birth" required error={errors.dateOfBirth}>
                <input
                  className="field-input"
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(event) =>
                    update("dateOfBirth", event.target.value)
                  }
                  aria-invalid={Boolean(errors.dateOfBirth)}
                />
              </Field>

              <Field label="Gender" required error={errors.gender}>
                <select
                  className="field-input"
                  value={data.gender}
                  onChange={(event) => update("gender", event.target.value)}
                  aria-invalid={Boolean(errors.gender)}
                >
                  <option value="">Select gender</option>

                  <option value="Male">Male</option>

                  <option value="Female">Female</option>

                  <option value="Other">Other</option>
                </select>
              </Field>
            </div>

            <div className="reg-columns">
              <Field label="State" required error={errors.state}>
                <select
                  className="field-input"
                  aria-label="State"
                  value={data.state}
                  onChange={(event) => {
                    const stateId = event.target.value;
                    update("state", stateId);
                    update("city", "");
                    loadCities(stateId);
                  }}
                  disabled={masterLoading}
                  data-testid="select-state"
                >
                  <option value="">
                    {masterLoading ? "Loading..." : "Choose state"}
                  </option>
                  {masterStep1.states.map((item) => (
                    <option key={item.state_id} value={String(item.state_id)}>
                      {item.state_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="City" required error={errors.city}>
                <select
                  className="field-input"
                  aria-label="City"
                  value={data.city}
                  onChange={(event) => update("city", event.target.value)}
                  disabled={!data.state || masterLoading}
                  data-testid="select-city"
                >
                  <option value="">
                    {!data.state
                      ? "Choose state first"
                      : masterLoading
                        ? "Loading..."
                        : "Choose city"}
                  </option>
                  {cities.map((item) => (
                    <option key={item.city_id} value={String(item.city_id)}>
                      {item.city_name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Occupation" required error={errors.occupation}>
              <select
                className="field-input"
                aria-label="Occupation"
                value={data.occupation}
                onChange={(event) => update("occupation", event.target.value)}
                data-testid="select-occupation"
              >
                <option value="">Choose occupation</option>
                {masterStep1.occupations.map((item) => (
                  <option key={item.occupation_id} value={item.name}>
                    {item.name || item.name || item.occupation_id}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Highest qualification"
              required
              error={errors.qualification}
            >
              <select
                className="field-input"
                aria-label="Highest qualification"
                value={data.qualification}
                onChange={(event) =>
                  update("qualification", event.target.value)
                }
                data-testid="select-qualification"
              >
                <option value="">Choose qualification</option>
                {masterStep1.qualifications.map((item) => (
                  <option key={item.qualification_id} value={item.name}>
                    {item.name || item.qualification_id}
                  </option>
                ))}
              </select>
            </Field>

            <div className="privacy-panel">
              <ShieldCheckIcon />

              <span>
                Personal details are securely collected as part of your listener
                registration.
              </span>
            </div>

            <label className="check-row">
              <input
                type="checkbox"
                checked={data.informationAccurate}
                onChange={(event) =>
                  update("informationAccurate", event.target.checked)
                }
                data-testid="check-information-accurate"
              />

              <span>
                I confirm the information provided is accurate.
                <b>*</b>
              </span>
            </label>

            {errors.informationAccurate && (
              <p className="field-error">{errors.informationAccurate}</p>
            )}

            <label className="check-row">
              <input
                type="checkbox"
                checked={data.agreedToTerms}
                onChange={(event) =>
                  update("agreedToTerms", event.target.checked)
                }
                data-testid="check-terms"
              />

              <span>
                I agree to the <a href="#terms">Terms &amp; Conditions</a> and{" "}
                <a href="#privacy">Privacy Policy</a>.<b>*</b>
              </span>
            </label>

            {errors.agreedToTerms && (
              <p className="field-error">{errors.agreedToTerms}</p>
            )}
          </>
        );

      // =====================================================
      // STEP 2
      // =====================================================

      case 2:
        return (
          <>
            <ChoiceGroup
              label="Select topics you are comfortable listening to"
              options={masterStep2.categories.map((item) => item.category_name)}
              selected={data.categories.map(
                (id) =>
                  masterStep2.categories.find((item) => item.category_id === id)
                    ?.category_name || id,
              )}
              onToggle={(value) => {
                const item = masterStep2.categories.find(
                  (option) => option.category_name === value,
                );
                if (item) toggleList("categories", item.category_id);
              }}
              error={errors.categories}
            />

            <ChoiceGroup
              label="Comfort language"
              options={masterStep2.languages.map((item) => item.name)}
              selected={data.languages.map(
                (id) =>
                  masterStep2.languages.find((item) => item.language_id === id)
                    ?.name || id,
              )}
              onToggle={(value) => {
                const item = masterStep2.languages.find(
                  (option) => option.name === value,
                );
                if (item) toggleList("languages", item.language_id);
              }}
              error={errors.languages}
            />

            <ChoiceGroup
              label="Who can you best relate to?"
              options={masterStep2.relatedTo.map(
                (item) => item.related_to_name,
              )}
              selected={data.relatableTopics.map(
                (id) =>
                  masterStep2.relatedTo.find(
                    (item) => item.related_to_id === id,
                  )?.related_to_name || id,
              )}
              onToggle={(value) => {
                const item = masterStep2.relatedTo.find(
                  (option) => option.related_to_name === value,
                );
                if (item) toggleList("relatableTopics", item.related_to_id);
              }}
              error={errors.relatableTopics}
            />
          </>
        );

      // =====================================================
      // STEP 3
      // =====================================================

      case 3:
        return (
          <>
            <TextArea
              label="What life experiences make you a good listener?"
              value={data.lifeExperiences}
              onChange={(value) => update("lifeExperiences", value)}
              required
              placeholder="Share experiences, challenges, and moments that shaped you…"
              error={errors.lifeExperiences}
              minLength={20}
            />

            <TextInput
              label="How would you describe your listening style?"
              value={data.listeningStyle}
              onChange={(value) => update("listeningStyle", value)}
              required
              placeholder="For example: empathetic, patient, non-judgmental…"
              error={errors.listeningStyle}
            />

            <TextArea
              label="Why do you want to join TalkOne?"
              value={data.motivation}
              onChange={(value) => update("motivation", value)}
              required
              placeholder="What motivates you to be there for others?"
              error={errors.motivation}
            />

            <div className="privacy-panel">
              <HeartIcon />

              <span>
                Be genuine. Share real experiences that may help others.
              </span>
            </div>
          </>
        );

      // =====================================================
      // STEP 4
      // =====================================================

      case 4:
        return (
          <>
            <div className="step-intro">
              <h3>A face helps people feel at ease.</h3>

              <p>
                Choose a clear, friendly profile photo. It will be visible to
                users in the reference flow.
              </p>
            </div>

            <FilePicker
              label="Profile photo"
              accept="image/*"
              capture="user"
              file={data.profilePhoto}
              onFile={(file) => update("profilePhoto", file)}
              error={errors.profilePhoto}
              testId="file-profile-photo"
            />

            <div className="guideline-list">
              <strong>Photo guidelines</strong>

              {[
                "Clear face",
                "Good lighting",
                "No sunglasses",
                "Single person only",
                "Friendly expression",
              ].map((item) => (
                <span key={item}>
                  <CheckCircle2 size={17} />
                  {item}
                </span>
              ))}
            </div>

            <p className="privacy-note">
              <Info size={16} />
              Selected files remain in browser memory only.
            </p>
          </>
        );

      // =====================================================
      // STEP 5
      // =====================================================

      case 5:
        return (
          <>
            <div className="step-intro">
              <h3>A short hello goes a long way.</h3>

              <p>Record or upload a 30-second audio introduction.</p>
            </div>

            <div className="record-panel">
              <div className="record-icon">
                <Mic size={23} />
              </div>

              <div>
                <strong>
                  {recording
                    ? `Recording in progress · 00:${String(
                        recordingSeconds,
                      ).padStart(2, "0")}`
                    : "Record a voice introduction"}
                </strong>

                <p>
                  {recording
                    ? "Recording stops automatically at 30 seconds."
                    : "Your browser will ask for microphone access. Maximum 30 seconds."}
                </p>
              </div>

              {!recording ? (
                <button
                  type="button"
                  className="button button-outline"
                  onClick={startRecording}
                  data-testid="button-start-recording"
                >
                  Record
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-dark"
                  onClick={stopRecording}
                  data-testid="button-stop-recording"
                >
                  Stop recording
                </button>
              )}
            </div>

            {recordingError && (
              <p className="field-error" role="alert">
                {recordingError}
              </p>
            )}

            {!recording ? (
              <FilePicker
                label="Audio introduction"
                accept="audio/*"
                file={data.audioIntro}
                onFile={chooseAudioFile}
                error={errors.audioIntro}
                testId="file-audio-intro"
              />
            ) : (
              <p className="field-hint">
                Stop recording before choosing an audio file.
              </p>
            )}

            <div className="guideline-list">
              <strong>Tips for a great intro</strong>

              {[
                "Introduce yourself",
                "Mention the topics you can help with",
                "Speak clearly and warmly",
              ].map((item) => (
                <span key={item}>
                  <CheckCircle2 size={17} />
                  {item}
                </span>
              ))}
            </div>
          </>
        );

      // =====================================================
      // STEP 6
      // =====================================================

      case 6:
        return (
          <>
            <div className="switch-list">
              {(
                [
                  ["chat", "Chat"],
                  ["call", "Call"],
                  ["videoCall", "Video Call"],
                  ["available", "Available for sessions"],
                ] as const
              ).map(([key, label]) => (
                <label className="switch-row" key={key}>
                  <span>
                    <strong>{label}</strong>

                    {key === "available" && (
                      <small>Turn on to let others connect with you.</small>
                    )}
                  </span>

                  <input
                    type="checkbox"
                    role="switch"
                    checked={data.services[key]}
                    onChange={(event) =>
                      setData((old) => ({
                        ...old,
                        services: {
                          ...old.services,
                          [key]: event.target.checked,
                        },
                      }))
                    }
                    data-testid={`toggle-${key}`}
                  />
                </label>
              ))}
            </div>

            {errors.services && (
              <p className="field-error" role="alert">
                {errors.services}
              </p>
            )}

            <div className="schedule-section">
              <h3>Your weekly schedule</h3>

              <p>Select the days and times you are typically available.</p>

              <div className="schedule-days">
                {weekdays.map((day) => (
                  <button
                    type="button"
                    className={`day-chip ${
                      (data.schedule[day]?.length ?? 0) > 0 ? "selected" : ""
                    }`}
                    key={day}
                    aria-pressed={(data.schedule[day]?.length ?? 0) > 0}
                    onClick={() =>
                      setData((old) => ({
                        ...old,
                        schedule: {
                          ...old.schedule,
                          [day]: old.schedule[day]?.length
                            ? []
                            : [...timeSlots],
                        },
                      }))
                    }
                    data-testid={`schedule-day-${day.toLowerCase()}`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="schedule-grid">
                {weekdays.map((day) => (
                  <div className="schedule-day" key={day}>
                    <strong>{day}</strong>

                    {timeSlots.map((slot) => (
                      <label key={slot} className="schedule-time">
                        <input
                          type="checkbox"
                          checked={data.schedule[day]?.includes(slot) ?? false}
                          onChange={() => toggleSchedule(day, slot)}
                          data-testid={`schedule-${day.toLowerCase()}-${slot
                            .split(" ")[0]
                            .toLowerCase()}`}
                        />

                        <span>{slot.split(" ")[0]}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <Field label="Response preference">
              <select
                className="field-input"
                aria-label="Response preference"
                value={data.responsePreference}
                onChange={(event) =>
                  update("responsePreference", Number(event.target.value))
                }
                data-testid="select-response-preference"
              >
                <option value={5}>Within 5 min</option>

                <option value={15}>Within 15 min</option>

                <option value={30}>Within 30 min</option>

                <option value={60}>Within 1 hour</option>

                <option value={1440}>Within a day</option>
              </select>
            </Field>
          </>
        );

      // =====================================================
      // STEP 7
      // =====================================================

      case 7:
        return (
          <>
            <div className="pricing-fields">
              <div className="price-row">
                <div>
                  <strong>Chat</strong>

                  <span>per minute · suggested ₹5–₹15</span>
                </div>

                <label className="rupee-input">
                  ₹
                  <input
                    aria-label="Chat price per minute in rupees"
                    type="number"
                    min="0"
                    max="10000"
                    value={data.pricing.chat}
                    onChange={(event) =>
                      setData((old) => ({
                        ...old,
                        pricing: {
                          ...old.pricing,
                          chat: Math.max(0, Number(event.target.value)),
                        },
                      }))
                    }
                    data-testid="input-price-chat"
                  />
                </label>
              </div>

              <div className="price-row">
                <div>
                  <strong>Audio</strong>

                  <span>per minute · suggested ₹8–₹25</span>
                </div>

                <label className="rupee-input">
                  ₹
                  <input
                    aria-label="Audio price per minute in rupees"
                    type="number"
                    min="0"
                    max="10000"
                    value={data.pricing.audio}
                    onChange={(event) =>
                      setData((old) => ({
                        ...old,
                        pricing: {
                          ...old.pricing,
                          audio: Math.max(0, Number(event.target.value)),
                        },
                      }))
                    }
                    data-testid="input-price-audio"
                  />
                </label>
              </div>
              <div className="price-row">
                <div>
                  <strong>Video</strong>
                  <span>per minute · suggested ₹15–₹50</span>
                </div>
                <label className="rupee-input">
                  ₹
                  <input
                    aria-label="Video price per minute in rupees"
                    type="number"

                    min="0"
                    max="10000"
                    value={data.pricing.video}
                    onChange={(event) =>
                      update("pricing", {
                        ...data.pricing,
                        video: Math.max(0, Number(event.target.value)),
                      })
                    }
                    data-testid="input-price-video"
                  />
                </label>
              </div>
            </div>

            <div className="earnings-panel">
              <Info size={20} />

              <div>
                <strong>Illustrative 60-minute earning example</strong>

                <p>₹600–₹1,200 based on an example mix of conversations.</p>

                <span>Example only — not a promise or payout estimate.</span>
              </div>
            </div>

            <label className="switch-row">
              <span>
                <strong>
                  Enable intro offers <em>Optional</em>
                </strong>

                <small>
                  Offer a discount to new listeners for a limited time.
                </small>
              </span>

              <input
                type="checkbox"
                role="switch"
                checked={data.pricing.introOffer}
                onChange={(event) =>
                  setData((old) => ({
                    ...old,
                    pricing: {
                      ...old.pricing,
                      introOffer: event.target.checked,
                    },
                  }))
                }
                data-testid="toggle-intro-offer"
              />
            </label>
          </>
        );

      // =====================================================
      // STEP 8
      // =====================================================

      case 8:
        return (
          <>
            <div className="step-intro">
              <h3>Identity documents</h3>

              <p>Upload your required verification documents.</p>
            </div>

            <FilePicker
              label="Aadhaar or valid photo ID front"
              accept="image/*,.pdf"
              file={data.kyc.identity}
              onFile={(file) =>
                setData((old) => ({
                  ...old,
                  kyc: {
                    ...old.kyc,
                    identity: file,
                  },
                }))
              }
              description="Front side of Aadhaar card or other valid photo ID."
              error={errors.identity}
              testId="file-kyc-identity"
            />

            <FilePicker
              label="PAN card"
              accept="image/*,.pdf"
              file={data.kyc.pan}
              onFile={(file) =>
                setData((old) => ({
                  ...old,
                  kyc: {
                    ...old.kyc,
                    pan: file,
                  },
                }))
              }
              description="Clear image of your PAN card."
              error={errors.pan}
              testId="file-kyc-pan"
            />

            <FilePicker
              label="Selfie / live photo"
              accept="image/*"
              capture="user"
              file={data.kyc.selfie}
              onFile={(file) =>
                setData((old) => ({
                  ...old,
                  kyc: {
                    ...old.kyc,
                    selfie: file,
                  },
                }))
              }
              description="A clear selfie or live photo."
              error={errors.selfie}
              testId="file-kyc-selfie"
            />

            <FilePicker
              label="Recent address proof"
              accept="image/*,.pdf"
              file={data.kyc.address}
              onFile={(file) =>
                setData((old) => ({
                  ...old,
                  kyc: {
                    ...old.kyc,
                    address: file,
                  },
                }))
              }
              description="Recent utility bill, rental agreement, or address proof."
              error={errors.address}
              testId="file-kyc-address"
            />

            <div className="privacy-panel">
              <LockKeyhole size={21} />

              <span>
                Your uploaded files are used for registration verification.
              </span>
            </div>
          </>
        );

      // =====================================================
      // STEP 9
      // =====================================================

      case 9:
        return (
          <>
            <TextInput
              label="Account holder name"
              value={data.bank.accountHolder}
              onChange={(value) =>
                setData((old) => ({
                  ...old,
                  bank: {
                    ...old.bank,
                    accountHolder: value,
                  },
                }))
              }
              required
              error={errors.accountHolder}
              autoComplete="off"
            />

            <TextInput
              label="Bank name"
              value={data.bank.bankName}
              onChange={(value) =>
                setData((old) => ({
                  ...old,
                  bank: {
                    ...old.bank,
                    bankName: value,
                  },
                }))
              }
              required
              error={errors.bankName}
              autoComplete="off"
            />

            <TextInput
              label="Account number"
              type="password"
              value={data.bank.accountNumber}
              onChange={(value) =>
                setData((old) => ({
                  ...old,
                  bank: {
                    ...old.bank,
                    accountNumber: value,
                  },
                }))
              }
              required
              error={errors.accountNumber}
              autoComplete="new-password"
              inputMode="numeric"
            />

            <TextInput
              label="Confirm account number"
              type="password"
              value={data.bank.confirmAccountNumber}
              onChange={(value) =>
                setData((old) => ({
                  ...old,
                  bank: {
                    ...old.bank,
                    confirmAccountNumber: value,
                  },
                }))
              }
              required
              error={errors.confirmAccountNumber}
              autoComplete="new-password"
              inputMode="numeric"
            />

            <TextInput
              label="IFSC code"
              value={data.bank.ifsc}
              onChange={(value) =>
                setData((old) => ({
                  ...old,
                  bank: {
                    ...old.bank,
                    ifsc: value.toUpperCase(),
                  },
                }))
              }
              required
              error={errors.ifsc}
              autoComplete="off"
            />

            <TextInput
              label="UPI ID (optional)"
              value={data.bank.upi}
              onChange={(value) =>
                setData((old) => ({
                  ...old,
                  bank: {
                    ...old.bank,
                    upi: value,
                  },
                }))
              }
              autoComplete="off"
            />

            <div className="privacy-panel">
              <Info size={21} />

              <span>
                <strong>Payout information:</strong> Payouts are released after
                admin approval and completion of the settlement cycle.
              </span>
            </div>

            <p className="privacy-note">
              <LockKeyhole size={16} />
              Your bank information is securely handled.
            </p>
          </>
        );

      default:
        return null;
    }
  };

  // =========================================================
  // SECTION NAMES
  // =========================================================

  const sectionNames = [
    "Basic Details & Profile",
    "Categories & Expertise",
    "Your Story",
    "Profile Photo",
    "Audio Introduction",
    "Availability",
    "Pricing",
    "KYC Verification",
    "Bank Details",
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="site-shell">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="header registration-header">
        <div className="wrap nav">
          <Link href="/" className="logo-link" aria-label="TalkOne home">
            <span className="brand" aria-label="TalkOne home">
              <span className="brand-logo-wrapper">
                <img src={logo} alt="TalkOne" className="brand-logo" />

                <span style={{ position: "absolute", left: 180 }}>TalkOne</span>
              </span>
            </span>
          </Link>

          <Link
            href="/"
            className="registration-exit"
            data-testid="link-registration-exit"
          >
            Exit
            <X size={16} />
          </Link>
        </div>
      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main className="registration journey">
        <div className="wrap journey-wrap">
          {stage < 10 ? (
            <>
              {/* ========================================= */}
              {/* INTRO */}
              {/* ========================================= */}

              <div className="registration-intro journey-intro">
                <span className="eyebrow">
                  {stage === 0
                    ? "Listener registration"
                    : `Step ${stage} of 10 · ${steps[stage - 1]}`}
                </span>

                <h1>
                  {stage === 0
                    ? "Make a little room to listen."
                    : stage === 1
                      ? "Join as a Listener / Expert"
                      : steps[stage - 1]}
                </h1>

                <p>
                  {stage === 0
                    ? "Start your TalkOne listener registration with your mobile number or email address."
                    : stage === 1
                      ? "Share a few basics to start your listener profile."
                      : "A thoughtful listener journey, one small step at a time."}
                </p>

                <div className="notice">
                  {stage === 0
                    ? "Your contact details will be used to create your TalkOne listener account."
                    : "Complete the information below to continue your listener registration."}
                </div>
              </div>

              {/* ========================================= */}
              {/* FORM */}
              {/* ========================================= */}

              <section
                className="form-card registration-form"
                aria-label={stage === 0 ? "Contact choice" : steps[stage - 1]}
              >
                {stage === 0 ? (
                  renderContact()
                ) : (
                  <>
                    {/* ================================= */}
                    {/* JOURNEY TOP */}
                    {/* ================================= */}

                    <div className="journey-top">
                      <p className="form-subtitle">
                        Step {stage} of 10 <span aria-hidden="true">•</span>{" "}
                        {steps[stage - 1]}
                      </p>

                      <div
                        className="step-progress"
                        aria-label={`Step ${stage} of 10`}
                        role="list"
                      >
                        {Array.from(
                          {
                            length: 10,
                          },
                          (_, index) => (
                            <span
                              key={index}
                              role="listitem"
                              aria-current={
                                index + 1 === stage ? "step" : undefined
                              }
                              className={index + 1 <= stage ? "complete" : ""}
                            >
                              {index + 1}
                            </span>
                          ),
                        )}
                      </div>
                    </div>

                    {/* ================================= */}
                    {/* STEP CONTENT */}
                    {/* ================================= */}

                    <div className="step-content" key={stage}>
                      {renderStep()}
                    </div>

                    {/* ================================= */}
                    {/* NAVIGATION */}
                    {/* ================================= */}

                    <div className="form-navigation">
                      <button
                        type="button"
                        className="button button-outline"
                        onClick={() => {
                          if (recording) {
                            stopRecording();
                          }

                          setErrors({});

                          setStage((current) => current - 1);

                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                        data-testid="button-step-back"
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>

                      <button
                        type="button"
                        className="button button-dark"
                        onClick={continueStep}
                        data-testid="button-step-continue"
                      >
                        {stage === 9 ? "Finish" : "Save & continue"}

                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </>
                )}
              </section>
            </>
          ) : (
            /* ================================================= */
            /* CONFIRMATION */
            /* ================================================= */

            <section
              className="confirmation-card"
              data-testid="status-demo-confirmation"
            >
              <div className="confirmation-mark">
                <Check size={36} />
              </div>

              <span className="eyebrow">Journey complete</span>

              <h1>Registration preview complete</h1>

              <p className="confirmation-copy">
                You reached the end of the TalkOne listener registration
                journey.
              </p>

              <div className="privacy-panel">
                <Info size={22} />

                <span>
                  Your initial listener account has been created successfully.
                </span>
              </div>

              <div className="review-note">
                <strong>What happens next?</strong>

                <p>
                  Your remaining registration information can be completed
                  through the next integration steps.
                </p>
              </div>

              <h2 className="checklist-title">
                Sections completed in this preview
              </h2>

              <div className="completed-list">
                {sectionNames.map((name, index) => (
                  <div key={name} className="completed-row">
                    <span className="completed-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span>{name}</span>

                    <CheckCircle2 size={19} />
                  </div>
                ))}
              </div>

              <button
                className="button button-outline"
                type="button"
                onClick={() => {
                  setData(initialData());

                  setErrors({});

                  setSubmitted(false);

                  setCreatingListener(false);

                  setStage(0);
                }}
                data-testid="button-restart-demo"
              >
                Restart registration
              </button>

              <span className="sr-only" role="status">
                {submitted ? "Registration flow complete." : ""}
              </span>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

// =========================================================
// ICON HELPERS
// =========================================================

function ShieldCheckIcon() {
  return <LockKeyhole size={21} aria-hidden="true" />;
}

function HeartIcon() {
  return <Heart size={21} aria-hidden="true" />;
}
