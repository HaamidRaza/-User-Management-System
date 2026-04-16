import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    // min-h-screen ensures the background color covers the full page height
    // bg-[#F9EDCC] sets our "paper" base from your palette
    <div className="min-h-screen bg-[#F9EDCC] flex flex-col">
      <Navbar />

      {/* 1. flex-1: pushes footer (if any) to bottom and grows to fill space
        2. w-full & max-w-7xl: standard SaaS "inner container" to prevent over-stretching
        3. mx-auto: centers the content
        4. px & py: consistent internal spacing scale
      */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Animate-in effect for a polished feel (subtle opacity fade) */}
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </main>
      
      {/* Optional: Simple Footer to ground the layout */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-[#61210F]/5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#61210F]/40">
          &copy; {new Date().getFullYear()} UserMS Dashboard — Internal Access Only
        </p>
      </footer>
    </div>
  );
};

export default Layout;