/* ------------------------------------------------------------------ */
/*  Home page content                                                 */
/* ------------------------------------------------------------------ */

export const NAME = "Ayush Anmol";
export const HANDLE = "ayush-anmol";
export const TAGLINE =
  "Recent CS grad building AI systems. Mostly figuring out things in public";

export const BIO_P1 =
  "I build applied AI systems like RAG pipelines, agents, and ML models and I like taking them from a notebook to something people can actually use.";
export const BIO_P2_BEFORE =
  "In my internships at ISRO, HPCL, and Neophyte.ai, I have worked on satellite image classification, a real-time speech-to-speech system, and published ";
export const BIO_P2_LINK = "a paper";
export const BIO_P2_AFTER = " on cover song detection along the way.";
export const BIO_P2 = BIO_P2_BEFORE + BIO_P2_LINK + BIO_P2_AFTER;

export const CURRENTLY = [
  "Open to remote part-time or contract work in applied and research AI (flexible hours welcome)",
  "Exploring agentic systems with LangGraph",
  "Sharpening DSA skills on LeetCode and Codeforces",
  "Learning about system design and ML systems",
];

export interface PreviouslyItem {
  post: string;
  company: string;
  work: string;
}
// When a role starts, fill this in — it renders as a "Now" slot above Previously.
// export const CURRENT_ROLE: PreviouslyItem | null = {
//   post: "AI Engineer",
//   company: "company",
//   work: "building agentic RAG systems for <domain>",
// };
export const CURRENT_ROLE: PreviouslyItem | null = null;

export const PREVIOUSLY: PreviouslyItem[] = [
  { post: "Summer Intern", company: "Neophyte.ai", work: "built a real-time speech-to-speech system (0.4s latency) and RAG pipelines hitting 0.90 retrieval accuracy" },
  { post: "Project Intern", company: "HPCL", work: "engineered a conversational database agent with automated query refinement, validated on 100+ queries" },
  { post: "Research Intern", company: "ISRO", work: "trained an R-CNN in PyTorch on 350+ multi-spectral satellite images for land-cover mapping" },
];

export const SKILLS = [
  "Python",
  "JavaScript/TypeScript",
  "C/C++",
  "SQL",
  "PyTorch",
  "TensorFlow",
  "Scikit-learn",
  "LangChain",
  "LangGraph",
  "FastAPI",
  "React",
  "Streamlit",
  "Git",
];

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
  cgpa: number;
}
export const EDUCATION: EducationItem[] = [
  { school: "IIIT, Bhubaneswar", degree: "B.Tech, Computer Science and Engineering", period: "2022 – 2026", cgpa: 8.1 },
];

export interface Project {
  name: string;
  description: string;
  tags: string[];
  github?: string;
  live?: string;
}

export const PROJECTS: Project[] = [
  {
  name: "Distributed Task Queue",
  description:
    "A Redis-backed distributed task queue built from scratch: priority streams with high→default draining, consumer-group delivery with crash recovery, exponential-backoff retries, dead-letter handling, and delayed/periodic scheduling — fronted by a FastAPI producer and a real-time React dashboard. Sustains 138 req/s at 0% failures under load.",
  tags: ["Python", "FastAPI", "Redis", "Docker", "React", "TypeScript"],
  github: "https://github.com/ayush-anmol/Distributed-task-queue",
  },
  {
    name: "Semantic Book Recommender",
    description:
      "A recommender that suggests books by meaning, not keywords but embedding similarity over 6,000+ book descriptions using a LangChain + Qdrant retrieval pipeline, served with a Gradio UI.",
    tags: ["Python", "LangChain", "Qdrant", "Sentence-Transformers", "Gradio"],
    github: "https://github.com/ayush-anmol/semantic_book_recommender",
  },
  {
    name: "Medical Chatbot",
    description:
      "A fully-offline RAG medical Q&A assistant: HuggingFace embeddings + ChromaDB vector search over 23K+ chunks from medical texts, answered by a local Ollama LLM with source citations.",
    tags: ["Python", "LangChain", "ChromaDB", "Ollama", "Chainlit"],
    github: "https://github.com/ayush-anmol/Medical-chatbot",
  },
  // {
  //   name: "Histopathological Image Classification",
  //   description:
  //     "A CNN that classifies histopathology images as cancerous vs. non-cancerous, trained on 300K+ images from the Kaggle Histopathologic Cancer Detection dataset — 0.88 accuracy.",
  //   tags: ["Python", "TensorFlow", "OpenCV"],
  //   github: "https://github.com/ayush-anmol",
  // },
];

export interface Publication {
  title: string;
  venue: string;
  year: string;
  link: string;
}

export const PUBLICATIONS: Publication[] = [
  {
    title: "Hierarchical BiLSTM Encoding for Vocal-Driven Cover Song Detection",
    venue: "OCIT-2025, IEEE",
    year: "2025",
    link: "https://ieeexplore.ieee.org/document/11400228",
  },
];

export interface NoteItem {
  date: string;
  text: string;
}

export const NOTES: NoteItem[] = [
  {
    date: "Jun 2026",
    text: "Graduated from IIIT Bhubaneswar with a B.Tech in Computer Science and Engineering.",
  },
  {
    date: "Dec 2025",
    text: "Published 'Hierarchical BiLSTM Encoding for Vocal-Driven Cover Song Detection' at OCIT-2025 (IEEE).",
  },
  {
    date: "Jul 2025",
    text: "Selected for Amazon ML Summer School 2025 (~2–5% acceptance rate).",
  },
  {
    date: "Jul 2025",
    text: "Wrapped up my summer internship at Neophyte.ai — real-time speech-to-speech at 0.4s latency, RAG pipelines, and OCR automation for 110 scanned invoices.",
  },
  {
    date: "Jan 2025",
    text: "Finished my project internship at HPCL — a conversational database agent with schema analysis and session memory.",
  },
  {
    date: "Aug 2024",
    text: "Completed my research internship at ISRO, training an R-CNN for land-use and land-cover mapping from satellite imagery.",
  },
  {
    date: "Dec 2023",
    text: "Finalist at Space India Hackathon, IISF 2023 (top 5%).",
  },
];

export const SOCIALS = {
  github: "https://github.com/ayush-anmol",
  linkedin: "https://linkedin.com/in/ayush-anmol",
  email: "aanmol.connect@gmail.com",
  leetcode: "https://leetcode.com/u/Ayush114",
  resume: "/Ayush_Anmol_Resume.pdf",
};
