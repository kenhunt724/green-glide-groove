import { Link } from "@tanstack/react-router";
import { ContactPhone } from "@/components/contact-phone";
import barcodeAsset from "@/assets/eps-website-barcode.png.asset.json";

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
          <div className="mt-5 inline-block border border-border bg-white p-2">
            <img
              src={barcodeAsset.url}
              alt="Barcode linking to earthresonancehub.com"
              width={200}
              height={60}
              loading="lazy"
              className="h-14 w-auto"
            />
            <p className="label-mono mt-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
              earthresonancehub.com
            </p>
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
          <Link to="/live" className="label-mono hover:text-signal">
            Live
          </Link>
          <Link to="/status" className="label-mono hover:text-signal">
            Status
          </Link>
        </nav>
      </div>
    </footer>
  );
}
