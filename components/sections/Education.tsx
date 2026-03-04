import SectionWrapper from "@/components/ui/SectionWrapper";
import EducationItem from "@/components/ui/EducationItem";
import { education } from "@/data/education";

export default function Education() {
  return (
    <SectionWrapper id="education">
      <h2 className="text-2xl font-bold text-[#000000] mb-6">Education</h2>
      <div>
        {education.map((item) => (
          <EducationItem key={item.id} item={item} />
        ))}
      </div>
    </SectionWrapper>
  );
}
