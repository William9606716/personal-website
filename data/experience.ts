import { ExperienceItem } from "@/types";

export const experience: ExperienceItem[] = [
  {
    id: "1",
    company: "ByteDance Seed",
    companyUrl: "https://seed.bytedance.com/en/",
    role: "Machine Learning Engineer Intern",
    startDate: "Sep 2025",
    endDate: "Dec 2025",
    location: "Beijing, China",
    bullets: [
      "Engineered SFT data pipelines and generated training insights supporting the fine-tuning of [Doubao Seed 1.8](https://seed.bytedance.com/en/seed1_8), which achieved a 15% increase in SWE-Bench-Verified performance from 57% to 72%",
      "Developed automated data ingestion system using AI workflow with JavaScript and the Lark API",
      "Designed an error code identification workflow that reduced trajectory review time by 80%",
      "Directed three data initiatives coordinating 100+ engineers, generating 5,000+ verified SFT training samples",
    ],
  },
  {
    id: "2",
    company: "Yunyou Health Tech",
    companyUrl: "https://www.yunyou.tech/",
    role: "Machine Learning Engineer Intern",
    startDate: "Jun 2024",
    endDate: "Aug 2024",
    location: "Shanghai, China",
    bullets: [
      "Optimized LSTM neural network for ECG signal classification, improving accuracy from 83% to 91%",
      "Designed end-to-end ECG signal processing pipeline using FFT for noise reduction and LSTM for arrhythmia detection, deployed to wearable medical devices",
    ],
  },
  {
    id: "3",
    company: "Liuhe Capital",
    companyUrl: "https://www.linkedin.com/company/liuhe-private-equity/",
    role: "Private Equity Intern",
    startDate: "Jun 2023",
    endDate: "Aug 2024",
    location: "Shanghai, China",
    bullets: [
      "Conducted in-depth financial analysis and valuation of a publicly traded company under the guidance of senior equity research analysts, drawing on sell-side research and company annual reports",
      "Wrote a 23-slide company report on China Tower (HKSX: 0788) and presented research to colleagues and the fund manager",
    ],
  },
  {
    id: "4",
    company: "Beta University",
    companyUrl: "https://www.betauniversity.org/",
    role: "Venture Capital Analyst Intern",
    startDate: "Sep 2023",
    endDate: "May 2024",
    location: "Silicon Valley, CA",
    bullets: [
      "Led the Beta Demo Day event, managing relationships with 50+ startup founders and 200+ investors",
      "Gained proficiency in assessing startups and sourced high-quality early-stage projects from Berkeley",
      "Oversaw Beta Fund's pre-acceleration incubation program for pre-seed and seed round startups, including managing the platform, connecting founders with mentors and investors, and coordinating speaker events",
    ],
  },
  {
    id: "5",
    company: "Optimir Consulting",
    companyUrl: "https://www.optimirconsulting.com/",
    role: "Project Manager",
    startDate: "Sep 2023",
    endDate: "May 2025",
    location: "Berkeley, CA",
    bullets: [
      "Led a 6-person consulting team through the end-to-end delivery of strategic projects for 4 Bay Area startups and organizations (Quokka Brew, Vango Rooter, Cal Triathlon Team, and Uvii), ensuring high client satisfaction and strict adherence to deadlines.",
      "Supported startup founders on product launch, pricing models, GTM strategy, sponsorship acquisition, and website revamp",
    ],
  },
  {
    id: "6",
    company: "HOX Business Fraternity",
    companyUrl: "https://calhox.com/",
    role: "Vice President",
    startDate: "Sep 2023",
    endDate: "May 2024",
    location: "Berkeley, CA",
    bullets: [
      "Managed the end-to-end recruitment and onboarding program, driving engagement and mentorship.",
      "Directed an intensive 9-week consulting and finance curriculum, leveraging expertise in accounting, financial modelling, and equity and market research to train 15 incoming pledges.",
      "Organized a professional speaker series, sourcing and coordinating with 10+ industry leaders from top-tier finance and consulting firms to deliver high-value guest lectures."
    ],
  },
];
