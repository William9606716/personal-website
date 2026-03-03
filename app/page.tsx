import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Education from "@/components/sections/Education";
import Experience from "@/components/sections/Experience";
import ChatPanel from "@/components/ui/ChatPanel";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="ml-96 flex-1 pr-96 min-h-screen">
          <div className="max-w-4xl mx-auto px-10 pt-20 pb-12">
            <Hero />
            <Education />
            <Experience />
            <Projects />
          </div>
        </main>
      </div>
      <ChatPanel />
    </>
  );
}
