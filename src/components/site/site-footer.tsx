import Link from "next/link";
import { nav } from "@/lib/sample-data";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper mt-24">
      <div className="container-wide pt-20 pb-10">
        {/* Newsletter */}
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end pb-16 border-b border-paper/15">
          <div className="max-w-xl">
            <Eyebrow className="text-paper/60">The Newsletter</Eyebrow>
            <h2 className="font-display text-3xl md:text-4xl mt-3 leading-tight text-paper">
              First looks, atelier notes, and quiet invitations.
            </h2>
          </div>
          <form className="flex items-end gap-3 max-w-md w-full">
            <label className="flex-1">
              <span className="sr-only">Email address</span>
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full bg-transparent border-b border-paper/30 pb-2 text-sm text-paper placeholder:text-paper/50 focus:outline-none focus:border-paper transition-colors"
              />
            </label>
            <Button
              variant="secondary"
              size="sm"
              className="!border-paper !text-paper hover:!bg-paper hover:!text-ink"
            >
              Subscribe
            </Button>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-16">
          <FooterCol title="Client Services" items={nav.footer.client} />
          <FooterCol title="The House" items={nav.footer.house} />
          <div>
            <Eyebrow className="text-paper/60">Contact</Eyebrow>
            <ul className="mt-5 space-y-2.5 text-sm text-paper/80">
              <li>+1 (212) 555&nbsp;0100</li>
              <li>care@atelier.example</li>
              <li className="pt-2 text-paper/60 leading-relaxed">
                14 Via Monte Napoleone<br />
                20121 Milano, Italy
              </li>
            </ul>
          </div>
          <div>
            <Eyebrow className="text-paper/60">Country</Eyebrow>
            <div className="mt-5 text-sm text-paper/80">
              United States · USD $
            </div>
          </div>
        </div>

        {/* Legal strip */}
        <div className="pt-14 mt-14 border-t border-paper/15 flex flex-col md:flex-row md:items-center md:justify-between gap-5 text-xs text-paper/50">
          <div className="flex items-center gap-6 flex-wrap">
            {nav.footer.legal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-paper transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div>© {new Date().getFullYear()} Atelier S.r.l. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <Eyebrow className="text-paper/60">{title}</Eyebrow>
      <ul className="mt-5 space-y-2.5 text-sm text-paper/80">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="hover:text-paper transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
