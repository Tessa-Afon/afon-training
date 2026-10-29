// First aid and BLS courses, from Tess's list (October 2026). These are not
// dated or booked online: each card asks people to contact us instead.

export type FirstAidCourse = {
  slug: string;
  title: string;
  description: string[];
  duration?: string;
  delivery?: string;
  certificate?: string;
  note?: string;
};

const BLENDED = "Face to face, or face to face combined with e-learning";

export const FIRST_AID_COURSES: FirstAidCourse[] = [
  {
    slug: "first-aid-at-work",
    title: "TQUK Level 3 First Aid at Work",
    description: [
      "Become a fully trained First Aider for your workplace. Learn how to handle a variety of workplace incidents including choking, bleeding, burns and administering CPR.",
    ],
    duration: "3 days",
    delivery: BLENDED,
    certificate: "Valid for 3 years",
  },
  {
    slug: "first-aid-at-work-requalification",
    title: "TQUK Level 3 First Aid at Work Requalification",
    description: [
      "The course is designed as an annual first aid refresher to keep your Level 3 qualification up to date through the 3 year period.",
    ],
    duration: "1 day",
    delivery: BLENDED,
    certificate: "Valid for 1 year",
  },
  {
    slug: "emergency-first-aid-at-work",
    title: "Emergency First Aid at Work & First Aid at Work Refresher",
    description: [
      "This Emergency First Aid at Work course is designed to learn the essentials of first aid and CPR.",
      "The course can also be used as an annual first aid refresher to keep your Level 3 qualification up to date through the 3 year period.",
    ],
    duration: "1 day",
    delivery: BLENDED,
    certificate: "Valid for 1 year",
  },
  {
    slug: "basic-life-support-aed",
    title: "Basic Life Support & AED for Healthcare Professionals",
    description: [
      "Learn the essential skills and knowledge to perform CPR and use an Automated External Defibrillator.",
    ],
    duration: "3 hours",
    delivery: "Face to face",
    certificate: "Valid for 1 year",
    note: "Please contact us to discuss different options available to suit busy practice requirements.",
  },
  {
    slug: "anaphylaxis-awareness",
    title: "Anaphylaxis Awareness",
    description: [
      "Recognise and respond to allergic reactions. Common triggers, signs of anaphylaxis, preventing exposure, use of adrenaline auto-injectors.",
      "This course can also cover administering adrenaline in a health care setting for clinical staff. Needle lengths, dosages and use of oxygen.",
    ],
    note: "This course can also be delivered as part of our BLS and AED module.",
  },
  {
    slug: "care-certificate",
    title: "Care Certificate (VTQ) Qualification",
    description: [
      "This course focuses on the theoretical aspects of the Care Certificate. It is designed to work alongside practical skills learnt in the workplace.",
      "Covering the 16 standards required, learning is done through e-learning with a training portfolio and tracking document provided to track progress and understanding.",
    ],
    delivery: "E-learning, or face to face if required",
    note: "We can also offer the option of face to face training if required. Please contact us for further information.",
  },
];
