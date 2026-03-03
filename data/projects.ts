import { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "1",
    title: "AInsteinBench",
    description: "Co-authored AInsteinBench, a large-scale benchmark designed to evaluate whether Large Language Models (LLMs) can effectively function as development agents within real-world scientific computing ecosystems. Unlike standard benchmarks that test basic conceptual knowledge or generic software engineering, AInsteinBench places models in authentic, production-grade research environments. The evaluation utilizes expertly curated tasks derived from real pull requests across six complex domains, including quantum computing, molecular dynamics, and fluid dynamics. By running these tasks in fully executable environments with test-driven verification, the benchmark rigorously measures a model's capacity to move beyond basic code generation and actively contribute to advanced computational scientific research.",
    institution: "ByteDance Seed Research",
    liveUrl: "https://arxiv.org/pdf/2512.21373",
    tech: ["Python", "LangChain", "PyTorch"],
    featured: true,
  },
  {
    id: "2",
    title: "COVID-19 Time Series Analysis",
    description:
      "Conducted frequency domain analysis of COVID-19 daily case data to isolate weekly, annual, and biannual periodicities. Applied Discrete Fourier Transforms (DFT) to model temporal dynamics, successfully identifying seasonal patterns to improve pandemic forecasting accuracy, and providing actionable insights for public health intervention planning",
    institution: "UC Berkeley",
    tech: ["Python", "NumPy", "Matplotlib", "SciPy"],
    featured: true,
  },
];
