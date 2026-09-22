import {
  emailFromName,
  hashSeed,
  phoneFromSeed,
} from "./candidate-identity";
import type { Enquiry } from "./types";

function clientSlug(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function companyEmail(contactName: string, company: string): string {
  const [firstName, ...rest] = contactName.split(" ");
  const lastName = rest.join("-") || firstName;
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${clientSlug(company)}.example`;
}

interface EnquirySeed {
  id: string;
  reference: string;
  contactName: string;
  company: string | null;
  type: Enquiry["type"];
  subject: string;
  message: string;
  source: string;
  owner: string | null;
  status: Enquiry["status"];
  receivedAt: string;
}

const enquirySeeds: EnquirySeed[] = [
  {
    id: "enq-0142",
    reference: "ENQ-0142",
    contactName: "Rachel Evans",
    company: "ABC Logistics",
    type: "Employer",
    subject: "Need 6 Class 1 drivers next week",
    message:
      "We're opening a new distribution operation in Coventry and need drivers starting immediately.",
    source: "Employer enquiry form",
    owner: null,
    status: "New",
    receivedAt: "Today · 10:42",
  },
  {
    id: "enq-0141",
    reference: "ENQ-0141",
    contactName: "Marcus Green",
    company: null,
    type: "Candidate",
    subject: "Question about current HGV vacancies",
    message:
      "I currently hold a Class 1 licence and CPC — do you have any live vacancies?",
    source: "Candidate enquiry form",
    owner: null,
    status: "New",
    receivedAt: "Today · 09:15",
  },
  {
    id: "enq-0140",
    reference: "ENQ-0140",
    contactName: "Priya Shah",
    company: null,
    type: "General",
    subject: "Updating my contact information",
    message:
      "Just wanted to update my phone number and email address on file.",
    source: "Website contact form",
    owner: "Taurai",
    status: "Responded",
    receivedAt: "Today · 08:20",
  },
  {
    id: "enq-0139",
    reference: "ENQ-0139",
    contactName: "Andrew Collins",
    company: "Fleet Training UK",
    type: "Partnership",
    subject: "Driver training partnership enquiry",
    message:
      "We'd like to explore a driver training partnership with Complex Recruitment.",
    source: "Email",
    owner: "Moremi",
    status: "In Review",
    receivedAt: "Yesterday · 16:40",
  },
  {
    id: "enq-0138",
    reference: "ENQ-0138",
    contactName: "Sarah Williams",
    company: "Northway Distribution",
    type: "Employer",
    subject: "Recruitment support for new warehouse",
    message:
      "We're setting up a new warehouse site and would like recruitment support.",
    source: "Phone",
    owner: "Shingi",
    status: "In Review",
    receivedAt: "Yesterday · 14:10",
  },
  {
    id: "enq-0137",
    reference: "ENQ-0137",
    contactName: "Daniel Brooks",
    company: null,
    type: "Candidate",
    subject: "Looking for temporary driving work",
    message: "I'm available for temporary driving work starting this week.",
    source: "Candidate enquiry form",
    owner: null,
    status: "New",
    receivedAt: "Yesterday · 11:05",
  },
  {
    id: "enq-0136",
    reference: "ENQ-0136",
    contactName: "Chloe Adams",
    company: "Westbridge Construction",
    type: "Employer",
    subject: "Enquiry about construction labour supply",
    message:
      "Looking into labour supply options for an upcoming construction project.",
    source: "Employer enquiry form",
    owner: "Taurai",
    status: "Converted",
    receivedAt: "Yesterday · 09:30",
  },
  {
    id: "enq-0135",
    reference: "ENQ-0135",
    contactName: "Michael Oyelaran",
    company: null,
    type: "Candidate",
    subject: "Interested in warehouse roles",
    message: "I saw your warehouse operative listings and wanted to find out more.",
    source: "Website contact form",
    owner: "Shingi",
    status: "Responded",
    receivedAt: "19 Sept · 15:50",
  },
  {
    id: "enq-0134",
    reference: "ENQ-0134",
    contactName: "Grace Fielding",
    company: null,
    type: "General",
    subject: "Feedback on recent application process",
    message: "Wanted to share some feedback on how my recent application was handled.",
    source: "Website contact form",
    owner: "Moremi",
    status: "Closed",
    receivedAt: "19 Sept · 13:20",
  },
  {
    id: "enq-0133",
    reference: "ENQ-0133",
    contactName: "Tom Richardson",
    company: "Prime Logistics Group",
    type: "Partnership",
    subject: "Preferred supplier partnership enquiry",
    message: "We supply PPE and would like to discuss a preferred supplier arrangement.",
    source: "Email",
    owner: null,
    status: "New",
    receivedAt: "19 Sept · 10:05",
  },
  {
    id: "enq-0132",
    reference: "ENQ-0132",
    contactName: "Olivia Hart",
    company: "Metro Distribution",
    type: "Employer",
    subject: "Need 4 forklift drivers urgently",
    message: "We urgently need forklift drivers for our Nottingham site.",
    source: "Phone",
    owner: "Taurai",
    status: "In Review",
    receivedAt: "19 Sept · 08:40",
  },
  {
    id: "enq-0131",
    reference: "ENQ-0131",
    contactName: "Emily Foster",
    company: null,
    type: "Candidate",
    subject: "Question about CPC card requirements",
    message: "Can you confirm what CPC card documentation you require from drivers?",
    source: "Candidate enquiry form",
    owner: "Shingi",
    status: "Converted",
    receivedAt: "18 Sept · 16:15",
  },
  {
    id: "enq-0130",
    reference: "ENQ-0130",
    contactName: "Hannah Price",
    company: "Coventry Freight Solutions",
    type: "Employer",
    subject: "General staffing enquiry",
    message: "Looking for general recruitment support across our sites.",
    source: "Employer enquiry form",
    owner: null,
    status: "Closed",
    receivedAt: "18 Sept · 12:30",
  },
  {
    id: "enq-0129",
    reference: "ENQ-0129",
    contactName: "James Whitlock",
    company: null,
    type: "General",
    subject: "Question about your services",
    message: "Just wanted to ask a few questions about the services you offer.",
    source: "Website contact form",
    owner: null,
    status: "New",
    receivedAt: "18 Sept · 09:50",
  },
  {
    id: "enq-0128",
    reference: "ENQ-0128",
    contactName: "Peter Nkomo",
    company: "Trident Industrial Services",
    type: "Employer",
    subject: "Ongoing plant operator staffing support",
    message: "We'd like ongoing support sourcing telehandler operators for our sites.",
    source: "Email",
    owner: "Moremi",
    status: "Converted",
    receivedAt: "17 Sept · 15:20",
  },
  {
    id: "enq-0127",
    reference: "ENQ-0127",
    contactName: "Zoe Campbell",
    company: null,
    type: "Candidate",
    subject: "Enquiry about site labourer positions",
    message: "Interested in site labourer roles in the Leicester area.",
    source: "Candidate enquiry form",
    owner: null,
    status: "New",
    receivedAt: "17 Sept · 11:40",
  },
  {
    id: "enq-0126",
    reference: "ENQ-0126",
    contactName: "Tom Ashford",
    company: "Greenfield Builders",
    type: "Employer",
    subject: "Site labourers needed for new development",
    message: "We have a new development starting and need site labourers.",
    source: "Phone",
    owner: "Taurai",
    status: "Responded",
    receivedAt: "17 Sept · 08:15",
  },
  {
    id: "enq-0125",
    reference: "ENQ-0125",
    contactName: "Laura Mitchell",
    company: "Skills Forward Training",
    type: "Partnership",
    subject: "Training provider partnership enquiry",
    message: "We provide driver training courses and would like to discuss partnering.",
    source: "Email",
    owner: "Shingi",
    status: "Closed",
    receivedAt: "16 Sept · 14:00",
  },
];

export const enquiries: Enquiry[] = enquirySeeds.map((seed) => {
  const identitySeed = hashSeed(seed.id);
  return {
    id: seed.id,
    reference: seed.reference,
    contactName: seed.contactName,
    company: seed.company,
    email: seed.company
      ? companyEmail(seed.contactName, seed.company)
      : emailFromName(seed.contactName),
    phone: phoneFromSeed(identitySeed),
    type: seed.type,
    subject: seed.subject,
    message: seed.message,
    source: seed.source,
    owner: seed.owner,
    status: seed.status,
    receivedAt: seed.receivedAt,
    unread: seed.status === "New",
  };
});

export const enquiryStatusFilterOptions = [
  "All statuses",
  "New",
  "In Review",
  "Responded",
  "Converted",
  "Closed",
] as const;

export const enquiryTypeFilterOptions = [
  "All types",
  "Employer",
  "Candidate",
  "General",
  "Partnership",
] as const;

export const enquirySummaryDisplayCounts = (() => {
  const all = enquiries.length;
  return {
    all,
    new: enquiries.filter((e) => e.status === "New").length,
    inReview: enquiries.filter((e) => e.status === "In Review").length,
    responded: enquiries.filter((e) => e.status === "Responded").length,
    converted: enquiries.filter((e) => e.status === "Converted").length,
  };
})();
