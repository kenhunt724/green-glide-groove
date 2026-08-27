import { Link } from "@tanstack/react-router";
import { ContactPhone } from "@/components/contact-phone";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-lg font-bold">EARTH PROTECTION SOCIETY</p>
          <p className="label-mono mt-2">Block 12 · Coming Soon · Sovereign charter · Customer-funded · Locally owned</p>
          <div className="mt-3">
            <ContactPhone />
          </div>
        </div>
        <nav className="flex flex-wrap gap-6">
          <Link to="/store" className="label-mono hover:text-signal">
            Store
          </Link>
          <Link to="/mobility" className="label-mono hover:text-signal">
            Mobility
          </Link>
          <Link to="/energy" className="label-mono hover:text-signal">
            Energy
          </Link>
          <Link to="/community" className="label-mono hover:text-signal">
            Trade Pipeline
          </Link>
          <Link to="/creators" className="label-mono hover:text-signal">
            Creator Vault
          </Link>
          <Link to="/about" className="label-mono hover:text-signal">
            About
          </Link>
          <Link to="/contact" className="label-mono hover:text-signal">
            Contact
          </Link>
          <Link to="/join" className="label-mono hover:text-signal">
            Join
          </Link>
          <Link to="/playbooks/commercial-bess" className="label-mono hover:text-signal">
            Playbook
          </Link>
        </nav>
      </div>
    </footer>
  );
}
