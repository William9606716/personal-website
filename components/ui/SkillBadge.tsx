interface SkillBadgeProps {
  skill: string;
}

export default function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-md bg-[#e5e7eb] text-[#374151]">
      {skill}
    </span>
  );
}
