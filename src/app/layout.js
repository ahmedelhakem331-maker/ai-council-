import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'AI Council — Five Minds. One Vision.',
  description: 'A platform where multiple AI agents simulate a council discussion to produce the best possible output. Unleash the power of collaborative AI.',
  keywords: 'AI, artificial intelligence, brainstorming, collaboration, SaaS, multi-agent',
  openGraph: {
    title: 'AI Council — Five Minds. One Vision.',
    description: 'Multiple AI agents collaborate to refine your ideas into actionable brilliance.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="font-inter antialiased bg-dark-900 text-dark-50 min-h-screen">
        <div className="relative">
          {/* Background ambient orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="bg-orb w-[600px] h-[600px] bg-neon-cyan top-[-200px] left-[-100px]" />
            <div className="bg-orb w-[500px] h-[500px] bg-neon-violet bottom-[-150px] right-[-100px]" />
            <div className="bg-orb w-[400px] h-[400px] bg-neon-emerald top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" style={{ opacity: 0.05 }} />
          </div>

          {/* Main content */}
          <div className="relative z-10">
            <Navbar />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
