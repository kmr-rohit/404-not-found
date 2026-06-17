import type { Conference, GeneratedOutput, Photo, Talk } from "../../drizzle/schema";

export const MOCK_CONFERENCE: Conference = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "KubeCon + CloudNativeCon India 2025",
  location: "Mumbai, India",
  startDate: new Date("2025-06-18T09:00:00+05:30"),
  endDate: new Date("2025-06-20T18:00:00+05:30"),
  createdAt: new Date(),
};

export const MOCK_TALKS: Talk[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    conferenceId: MOCK_CONFERENCE.id,
    title: "Keynote: The Future of Cloud Native",
    speaker: "Priya Sharma",
    track: "Keynote",
    scheduledAt: new Date("2025-06-18T10:00:00+05:30"),
    transcript:
      "Welcome everyone to KubeCon Mumbai. Today we'll explore how Kubernetes is evolving for the next decade...",
    createdAt: new Date(),
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    conferenceId: MOCK_CONFERENCE.id,
    title: "Platform Engineering at Scale",
    speaker: "Arjun Mehta",
    track: "Platform Engineering",
    scheduledAt: new Date("2025-06-18T14:00:00+05:30"),
    transcript: "",
    createdAt: new Date(),
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    conferenceId: MOCK_CONFERENCE.id,
    title: "Observability with OpenTelemetry",
    speaker: "Sneha Patel",
    track: "Observability",
    scheduledAt: new Date("2025-06-19T11:30:00+05:30"),
    transcript: "",
    createdAt: new Date(),
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    conferenceId: MOCK_CONFERENCE.id,
    title: "GitOps in Production: Lessons Learned",
    speaker: "Rahul Verma",
    track: "GitOps",
    scheduledAt: new Date("2025-06-19T15:00:00+05:30"),
    transcript: "",
    createdAt: new Date(),
  },
  {
    id: "10000000-0000-0000-0000-000000000005",
    conferenceId: MOCK_CONFERENCE.id,
    title: "AI Workloads on Kubernetes",
    speaker: "Dr. Ananya Iyer",
    track: "AI/ML",
    scheduledAt: new Date("2025-06-20T10:00:00+05:30"),
    transcript: "",
    createdAt: new Date(),
  },
];

export const MOCK_PHOTOS: Photo[] = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    talkId: MOCK_TALKS[0].id,
    fileId: "mock-file-1",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    caption: "Opening keynote stage",
    createdAt: new Date(),
  },
];

export const MOCK_OUTPUTS: GeneratedOutput[] = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    talkId: MOCK_TALKS[0].id,
    type: "summary",
    content:
      "- KubeCon Mumbai kicks off with a focus on platform engineering maturity\n- Kubernetes adoption in India is accelerating across fintech and telecom\n- Key themes: AI workloads, GitOps, and observability standardization\n- Community growth highlighted with 500+ new CNCF contributors in APAC",
    createdAt: new Date(),
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    talkId: MOCK_TALKS[0].id,
    type: "tweet",
    content:
      "KubeCon Mumbai is LIVE! 🚀 The cloud native community in India is massive. Key takeaway from the keynote: platform engineering is the new DevOps. #KubeCon #CloudNative #Kubernetes",
    createdAt: new Date(),
  },
];
