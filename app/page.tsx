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
        <main className="lg:ml-80 flex-1 lg:pr-[22rem] min-h-screen">
          <div className="max-w-[57rem] mx-auto px-4 sm:px-6 lg:px-10 pt-20 pb-12">
            {/* Mobile-only profile card */}
            <div className="lg:hidden flex flex-col items-center text-center mb-8">
              <img
                src="/avatar.jpg"
                alt="William Peng"
                className="w-28 h-28 rounded-full object-cover mb-4"
              />
              <h1 className="text-2xl font-bold text-[#111827]">William Peng</h1>
              <p className="text-sm text-[#6b7280] mt-1">CS and Econ @ UC Berkeley</p>
              <div className="flex flex-col items-center gap-2 mt-3">
                <a
                  href="mailto:williamsichuan@berkeley.edu"
                  className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#111827] transition-colors"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <span>williamsichuan@berkeley.edu</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/william-peng-725083193/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#111827] transition-colors"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://casanovaphotography.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#111827] transition-colors"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm3.2-5c0 1.77-1.43 3.2-3.2 3.2S8.8 14.77 8.8 13 10.23 9.8 12 9.8 15.2 11.23 15.2 13z" />
                  </svg>
                  <span>Photography</span>
                </a>
              </div>
            </div>
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
