"use client";

import { useState } from "react";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const primaryUrl = project.liveUrl || project.githubUrl;

  return (
    <div className="border-b border-[#e5e7eb]">
      <div
        className="flex items-center py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-bold text-[#111827]">
          {primaryUrl ? (
            <a
              href={primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#000000] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {project.title}
              <svg
                className="inline ml-1 mb-0.5"
                width="11"
                height="11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          ) : (
            project.title
          )}
        </span>
        <span className="text-sm text-[#6b7280] ml-auto mr-4 whitespace-nowrap hidden sm:inline">
          {project.institution ?? project.tech[0]}
        </span>
        <svg
          className={`transition-transform duration-200 shrink-0 text-[#6b7280] ${expanded ? "rotate-180" : ""}`}
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-[1200px] pb-4" : "max-h-0"}`}
      >
        <p className="text-sm text-[#6b7280] leading-relaxed mb-3">
          {project.description}
        </p>
        {project.abstract && (
          <p className="text-sm text-[#6b7280] leading-relaxed mb-3 italic">
            {project.abstract}
          </p>
        )}
        <div className="flex flex-wrap gap-3 mb-3">
          {project.tech.map((t) => (
            <span key={t} className="text-xs text-[#000000]">
              {t}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          {project.githubUrl && project.githubUrl !== primaryUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#6b7280] hover:text-[#111827] transition-colors"
            >
              GitHub ↗
            </a>
          )}
          {project.liveUrl && project.liveUrl !== primaryUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#6b7280] hover:text-[#111827] transition-colors"
            >
              Live ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
