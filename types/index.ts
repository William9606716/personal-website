export interface Project {
  id: string;
  title: string;
  description: string;
  abstract?: string;
  institution?: string;
  tech: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}

export interface ExperienceItem {
  id: string;
  company: string;
  companyUrl?: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  schoolUrl?: string;
  degree?: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
