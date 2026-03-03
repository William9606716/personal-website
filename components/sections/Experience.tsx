import SectionWrapper from "@/components/ui/SectionWrapper";
import ExperienceItem from "@/components/ui/ExperienceItem";
import { experience } from "@/data/experience";

export default function Experience() {
  return (
    <SectionWrapper id="experience">
      <h2 className="text-2xl font-bold text-[#000000] mb-6">Experience</h2>
      <div>
        {experience.map((item) => (
          <ExperienceItem key={item.id} item={item} />
        ))}
      </div>
    </SectionWrapper>
  );
}
