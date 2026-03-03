"use client";

import { useState } from "react";
import { EducationItem as EducationItemType } from "@/types";

interface EducationItemProps {
  item: EducationItemType;
}

function renderBullet(text: string) {
  const parts = text.split(/(\[.+?\]\(.+?\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(.+?)\]\((.+?)\)$/);
    if (match) {
      return (
        <a
          key={i}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#111827] transition-colors"
        >
          {match[1]}
        </a>
      );
    }
    return part;
  });
}

export default function EducationItem({ item }: EducationItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-[#e5e7eb]">
      <div
        className="flex items-center py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-semibold text-[#111827]">
          {item.schoolUrl ? (
            <a
              href={item.schoolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#000000] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {item.school}
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
            item.school
          )}
        </span>
        <span className="text-sm text-[#6b7280] ml-auto mr-4 whitespace-nowrap hidden lg:inline">
          {item.degree}
        </span>
        <span className="text-xs text-[#6b7280] mr-4 whitespace-nowrap hidden md:inline">
          {item.startDate} – {item.endDate}
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
        className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-[500px] pb-4" : "max-h-0"}`}
      >
        <p className="text-xs text-[#6b7280] mb-3 sm:hidden">
          {item.degree ? `${item.degree} · ` : ""}{item.startDate} – {item.endDate}
        </p>
        <div className="space-y-1">
          {item.bullets.map((line, i) => (
            <p key={i} className="text-sm text-[#374151] leading-relaxed">
              {renderBullet(line)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
