import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import FlipCard from "@/components/FlipCard";
import { ActiveContextProvider } from "@/core/ActiveContext";
import { ContactsPanel } from "@/features/crm/ContactsPanel";
import Dialog, { DialogContent } from "@/components/ui/dialog";

vi.mock("@/api", () => ({
  apiFetch: vi.fn().mockResolvedValue([]),
}));

describe("UI snapshots", () => {
  it("captures the flipcard toolbar", () => {
    const markup = renderToStaticMarkup(
      <ActiveContextProvider>
        <FlipCard front={<div>Front</div>} back={<div>Back</div>} />
      </ActiveContextProvider>,
    );
    expect(markup).toMatchInlineSnapshot(`"<div class=\"flip-card-host flip-host\" style=\"width:min(880px, 96vw);height:min(720px, 80vh)\" data-testid=\"flip-card\" data-size=\"lg\"><div class=\"flip-card flipcard cardbg flip-card--lg \" role=\"group\" aria-roledescription=\"flip card\" tabindex=\"0\" data-side=\"front\" data-motion=\"default\" data-style=\"3d\"><div class=\"flip-card-toolbar\"><div class=\"flip-card-toolbar__side\" aria-live=\"polite\"><span class=\"chip\" data-testid=\"flip-card-side\">Buoy</span><button type=\"button\" class=\"chip flip-card-toolbar__flip\" aria-label=\"Show Navi\">Show Navi</button></div><div class=\"flip-card-toolbar__actions\"><button type=\"button\" class=\"chip flip-card-toolbar__connect\" aria-haspopup=\"dialog\" aria-label=\"Connect Select a record\">Connect</button><button type=\"button\" class=\"chip flip-card-toolbar__resize\" aria-label=\"Resize card (lg)\">Resize</button></div></div><section id=\":R0:\" class=\"flip-card-face flip-card-face--front\" aria-hidden=\"false\" aria-label=\"Buoy panel\"><div class=\"flip-face-content\" data-testid=\"flip-card-front\"><div>Front</div></div></section><section id=\":R0H1:\" class=\"flip-card-face flip-card-face--back\" aria-hidden=\"true\" aria-label=\"Navi panel\"><div class=\"flip-face-content\" data-testid=\"flip-card-back\"><div>Back</div></div></section></div></div>"`);
  });

  it("captures the contacts table header", () => {
    const markup = renderToStaticMarkup(<ContactsPanel />);
    expect(markup).toMatchInlineSnapshot(`"<div class=\"rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 shadow-sm backdrop-blur m-2\"><div class=\"p-6 pt-0\"><div class=\"mb-4 flex items-center justify-between gap-3\"><h2 class=\"text-xl font-bold text-slate-100\">Kontakter</h2><div class=\"flex items-center gap-2\"><button type=\"button\" class=\"inline-flex items-center justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition bg-transparent text-slate-100 hover:bg-slate-800/60 h-8 text-xs px-2\" aria-pressed=\"false\">Tidslag</button><button type=\"button\" class=\"inline-flex items-center justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition bg-transparent text-slate-100 hover:bg-slate-800/60 h-8 text-xs px-2\" aria-pressed=\"false\">Vis kart</button><button type=\"button\" class=\"inline-flex items-center justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition bg-indigo-600 text-white hover:bg-indigo-500 h-10\">Legg til kontakt</button></div></div><div class=\"overflow-x-auto\"><table class=\"min-w-full divide-y divide-slate-800 text-sm\"><thead><tr class=\"text-left text-xs uppercase tracking-wide text-slate-400\"><th class=\"px-2 py-2\">ID</th><th class=\"px-2 py-2\">Navn</th><th class=\"px-2 py-2\">E-post</th><th class=\"px-2 py-2\">Telefon</th><th class=\"px-2 py-2\">Handlinger</th></tr></thead><tbody class=\"divide-y divide-slate-900\"></tbody></table></div></div></div>"`);
  });

  it("captures the dialog shell", () => {
    const markup = renderToStaticMarkup(
      <Dialog defaultOpen>
        <DialogContent aria-labelledby="snapshot-heading">
          <h2 id="snapshot-heading">Snapshot</h2>
          <p>Dialog body</p>
        </DialogContent>
      </Dialog>,
    );
    expect(markup).toMatchInlineSnapshot(`"<div class=\"fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6\" role=\"presentation\"><div class=\"w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900/95 p-6 text-slate-100 shadow-xl\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"snapshot-heading\"><h2 id=\"snapshot-heading\">Snapshot</h2><p>Dialog body</p></div></div>"`);
  });
});
