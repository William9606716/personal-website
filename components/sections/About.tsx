import SectionWrapper from "@/components/ui/SectionWrapper";
import { skills } from "@/data/skills";

export default function About() {
  return (
    <SectionWrapper id="about" className="border-t border-[#e5e7eb]">
      <h2 className="text-2xl font-bold text-[#2563eb] mb-8">About</h2>

      <div className="space-y-3 text-sm text-[#374151] leading-relaxed mb-10">
        <p>
          Hi, I&apos;m a Junior at UC Berkeley studying Computer Science...
        </p>
      </div>

      <div className="space-y-5">
        {skills.map((group) => (
          <div key={group.category}>
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">
              {group.category}
            </h3>
            <p className="text-sm text-[#2563eb]">
              {group.skills.join(" · ")}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
