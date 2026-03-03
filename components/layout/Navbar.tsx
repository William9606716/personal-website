export default function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#fafafa]/90 backdrop-blur-sm border-b border-[#e5e7eb]">
      <nav className="px-6 h-14 flex items-center justify-center gap-8">
        <a
          href="#about"
          className="text-[0.9rem] uppercase tracking-[0.05em] text-[#6b7280] hover:text-[#111827] transition-colors"
        >
          About
        </a>
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.9rem] uppercase tracking-[0.05em] text-[#6b7280] hover:text-[#111827] transition-colors"
        >
          Resume
        </a>
      </nav>
    </header>
  );
}
