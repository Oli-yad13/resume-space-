import { Trans } from "@lingui/macro";
import { BookOpen, Briefcase } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Link } from "react-router";

import { Logo } from "@/client/components/logo";

// import { DonationBanner } from "./donation-banner";

export const Header = () => (
  <motion.header
    className="fixed inset-x-0 top-0 z-20"
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.3 } }}
  >
    {/* <DonationBanner /> */}

    <div className="bg-gradient-to-b from-background to-transparent py-3">
      <div className="container flex items-center justify-between">
        <Link to="/" className="transition-opacity hover:opacity-70">
          <Logo size={40} />
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/resources"
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
          >
            <BookOpen size={18} />
            <Trans>Resources</Trans>
          </Link>
          <Link
            to="/jobs"
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
          >
            <Briefcase size={18} />
            <Trans>Jobs</Trans>
          </Link>
          <Link
            to="/auth/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Trans>Get Started</Trans>
          </Link>
        </nav>
      </div>
    </div>
  </motion.header>
);
