// Upcoming courses. Tess's course details go here until there is an admin area.
// Dates are ISO (YYYY-MM-DD), times are 24-hour (HH:MM), price is whole pounds.
export type CourseStatus = "Places available" | "Few places left" | "Fully booked";

export type Course = {
  slug: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  pricePerPerson: number;
  delivery: string;
  trainer: string;
  maxAttendees: number;
  status: CourseStatus;
  image: CourseImage;
  details?: CourseDetails;
};

// Card header image. Placeholder illustrations in public/courses/ until Tess
// supplies photos.
export type CourseImage = { src: string; alt: string };

// Full course information, shown on the course page. Optional: courses
// without it show just their one-line description.
export type CourseDetails = {
  subtitle: string;
  intro: string[];
  includes?: string;
  whoShouldAttend: string[];
  covers: string[];
  outcomes: string[];
  beforeAttending?: string;
};

const HALF_DAY = 49;
const FULL_DAY = 95;

const DEFAULTS = {
  delivery: "Online via Microsoft Teams",
  trainer: "Tessa Clarke",
  maxAttendees: 15,
  status: "Places available",
} as const;

const DESCRIPTIONS: Record<string, string> = {
  "Improving the Patient Experience":
    "Practical ways to make every patient interaction clearer, more respectful and more responsive.",
  "Medical Record Summarising for GP Practices":
    "Develop a structured approach to reviewing and summarising patient records, identifying relevant information and maintaining clear, consistent electronic summaries.",
  "Handling Abusive Patients and Conflict Resolution":
    "Practical techniques for responding calmly, setting boundaries and managing challenging behaviour safely.",
  "Chaperone Training":
    "Develop the knowledge and confidence to understand the chaperone role, support patients during sensitive examinations and recognise when to speak up or seek help.",
  "Medical Terminology for Non-Clinical Staff":
    "Learn the common terms, abbreviations and language used in healthcare to support confident communication and administration.",
  "Excellent Customer Service and Improving the Patient Experience":
    "A practical full-day course on delivering welcoming, effective service and improving the patient journey.",
  "Mental Health Awareness":
    "Develop awareness of common mental-health needs and how to respond appropriately, sensitively and within your role.",
  "Preparing for a CQC Inspection":
    "Understand how to prepare staff, evidence and everyday systems for a confident CQC inspection.",
};

const DETAILS: Record<string, CourseDetails> = {
  "Medical Record Summarising for GP Practices": {
    subtitle: "A practical, interactive course for primary care staff",
    intro: [
      "This course is designed for staff responsible for medical record summarising in general practice. Through practical examples and discussion, attendees will explore the purpose of summarising and work through a suggested step-by-step approach to reviewing the records of newly registered patients.",
      "The session will also explore how relevant information from incoming clinical correspondence contributes to an accurate, up-to-date patient record, with an emphasis on working within agreed practice procedures and recognising when clinical clarification is needed.",
    ],
    includes: "Certificate of attendance and electronic workbook included.",
    whoShouldAttend: [
      "New medical record summarisers.",
      "Medical administrators and other primary care staff whose roles include summarising or clinical coding.",
      "Existing summarisers looking to refresh their approach and improve consistency.",
    ],
    covers: [
      "The purpose of medical record summarising and its role in supporting continuity of care.",
      "A step-by-step approach to reviewing and organising historical records.",
      "Identifying relevant diagnoses, significant medical and surgical history, allergies and other information within the agreed scope of the summariser's role.",
      "Using clinical terminology and coding appropriately, including SNOMED CT where applicable.",
      "Recording information accurately without introducing unsupported assumptions or diagnoses.",
      "Recognising missing, conflicting, duplicated or unclear information and knowing when to escalate it.",
      "Extracting relevant information from incoming correspondence and distinguishing recording tasks from requests requiring clinical review or action.",
      "Confidentiality, secure handling of patient information and working within local procedures.",
      "Practical examples and opportunities for discussion.",
    ],
    outcomes: [
      "Explain the purpose and scope of medical record summarising.",
      "Apply a structured approach to reviewing a newly registered patient's records.",
      "Identify information for inclusion in a summary in accordance with agreed practice procedures.",
      "Explain the importance of accurate coding and clear supporting documentation.",
      "Recognise uncertainty and situations requiring review by an appropriate clinician.",
      "Describe how their work should be checked and supported within the practice.",
    ],
    beforeAttending:
      "Attendees should have a working knowledge of medical terminology, experience of navigating their practice's clinical system and familiarity with the clinical coding terminology used in their setting. This should include familiarity with SNOMED CT. Read/CTV3 knowledge may be useful for understanding historical records but is not essential.",
  },
  "Chaperone Training": {
    subtitle: "A practical, interactive course for Clinical and Non-Clinical staff",
    intro: [
      "This course is designed for clinical and non-clinical staff who may act as formal chaperones. It is also relevant to staff who explain chaperone services to patients or help organise their availability.",
      "This interactive course explores current national guidance for chaperoning, with a focus on patient dignity, consent, confidentiality, safeguarding and clear professional boundaries. These are central elements of CQC and GMC guidance.",
    ],
    includes: "Certificate of attendance and electronic workbook included.",
    whoShouldAttend: [
      "Reception, administrative and other non-clinical staff identified to undertake formal chaperone duties.",
      "Existing chaperones seeking a refresher.",
      "Clinical staff who undertake or support examinations where a chaperone may be appropriate.",
      "Staff responsible for explaining the service to patients or coordinating chaperone arrangements.",
    ],
    covers: [
      "What a formal chaperone is and why the role matters.",
      "The responsibilities and boundaries of the role.",
      "Recognising when a chaperone should be offered.",
      "What is meant by an intimate examination.",
      "Communicating chaperone services and offering chaperones sensitively.",
      "Understanding how to respond to concerns about patient safety or a clinician's behaviour.",
      "Be aware of the rights of the patient.",
      "Maintaining dignity, privacy and confidentiality.",
      "Understanding the examination sufficiently to undertake the role.",
      "Recognising distress, discomfort or concerns.",
      "Professional behaviour and speaking up appropriately.",
      "Record keeping as a chaperone.",
    ],
    outcomes: [
      "Define the role and purpose of a formal chaperone.",
      "Recognise intimate examinations and other situations in which a chaperone may be appropriate.",
      "Explain chaperone services clearly and sensitively to patients.",
      "Describe patients' rights relating to dignity, privacy, consent and stopping an examination.",
      "Describe a chaperone's responsibilities before, during and after an examination.",
      "Explain appropriate positioning, observation and support during an examination.",
      "Recognise distress or concerning behaviour and describe how to raise concerns.",
      "Identify the documentation required under their practice's procedures.",
    ],
  },
};

// [date, title, start, end, price]
const SCHEDULE: [string, string, string, string, number][] = [
  ["2027-04-13", "Improving the Patient Experience", "13:00", "16:00", HALF_DAY],
  ["2027-04-14", "Medical Record Summarising for GP Practices", "09:30", "12:30", HALF_DAY],
  ["2027-04-15", "Handling Abusive Patients and Conflict Resolution", "13:00", "16:00", HALF_DAY],
  ["2027-04-20", "Medical Record Summarising for GP Practices", "13:00", "16:00", HALF_DAY],
  ["2027-04-21", "Chaperone Training", "13:00", "16:00", HALF_DAY],
  ["2027-04-22", "Medical Terminology for Non-Clinical Staff", "09:30", "16:30", FULL_DAY],
  ["2027-05-05", "Excellent Customer Service and Improving the Patient Experience", "09:30", "16:30", FULL_DAY],
  ["2027-05-19", "Handling Abusive Patients and Conflict Resolution", "13:00", "16:00", HALF_DAY],
  ["2027-06-15", "Chaperone Training", "13:00", "16:00", HALF_DAY],
  ["2027-06-16", "Medical Record Summarising for GP Practices", "13:00", "16:00", HALF_DAY],
  ["2027-06-17", "Mental Health Awareness", "13:00", "16:00", HALF_DAY],
  ["2027-06-22", "Medical Terminology for Non-Clinical Staff", "09:30", "16:30", FULL_DAY],
  ["2027-06-23", "Handling Abusive Patients and Conflict Resolution", "13:00", "16:00", HALF_DAY],
  ["2027-06-24", "Excellent Customer Service and Improving the Patient Experience", "09:30", "16:30", FULL_DAY],
  ["2027-07-07", "Preparing for a CQC Inspection", "09:30", "16:30", FULL_DAY],
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const IMAGES: Record<string, CourseImage> = {
  "Improving the Patient Experience": { src: "/courses/patient-experience.svg", alt: "Speech bubble with smile" },
  "Medical Record Summarising for GP Practices": { src: "/courses/record-summarising.svg", alt: "Patient record with magnifying glass" },
  "Handling Abusive Patients and Conflict Resolution": { src: "/courses/conflict-resolution.svg", alt: "Two speech bubbles" },
  "Chaperone Training": { src: "/courses/chaperone.svg", alt: "Two people" },
  "Medical Terminology for Non-Clinical Staff": { src: "/courses/medical-terminology.svg", alt: "Open book" },
  "Excellent Customer Service and Improving the Patient Experience": { src: "/courses/customer-service.svg", alt: "Star" },
  "Mental Health Awareness": { src: "/courses/mental-health.svg", alt: "Head with a heart" },
  "Preparing for a CQC Inspection": { src: "/courses/cqc-inspection.svg", alt: "Clipboard with a tick" },
};

export const COURSES: Course[] = SCHEDULE.map(([date, title, startTime, endTime, pricePerPerson]) => ({
  ...DEFAULTS,
  slug: `${slugify(title)}-${date}`,
  title,
  description: DESCRIPTIONS[title],
  image: IMAGES[title],
  details: DETAILS[title],
  date,
  startTime,
  endTime,
  pricePerPerson,
}));

export function upcomingCourses(today = new Date()): Course[] {
  const todayIso = today.toISOString().slice(0, 10);
  return COURSES.filter((c) => c.date >= todayIso).sort((a, b) =>
    (a.date + a.startTime).localeCompare(b.date + b.startTime),
  );
}

export function groupByMonth(courses: Course[]): { month: string; courses: Course[] }[] {
  const groups = new Map<string, Course[]>();
  for (const c of courses) {
    const key = c.date.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  return Array.from(groups, ([key, list]) => ({
    month: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(`${key}-01T00:00:00Z`),
    ),
    courses: list,
  }));
}

export function findCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(`${iso}T00:00:00Z`))
    .replace(",", "");
}

// UK style: 9.30am, 1.00pm
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}.${String(m).padStart(2, "0")}${h >= 12 ? "pm" : "am"}`;
}

export function formatTimeRange(c: Pick<Course, "startTime" | "endTime">): string {
  return `${formatTime(c.startTime)}–${formatTime(c.endTime)}`;
}

export function formatPrice(pounds: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: Number.isInteger(pounds) ? 0 : 2,
  }).format(pounds);
}
