# Demo-flows

Dette dokumentet beskriver de to demo-scenariene som er bygget inn i WorkBuoy-UI. Demo-modus kan startes på to måter:

- Legg til `?demo=1` i URL-en og last siden på nytt.
- Åpne **Innstillinger** i Navi-panelet og trykk på **Start demo**. Knappen oppdaterer URL-en og slår på alle integrasjonspaneler.

Når demo-modus er aktiv markeres dette i innstillingene, og de nye Navi-kortene for samarbeid, Google Workspace og Visma vises.

## Flow 1 – Kontakt til avtale med audit og angre

1. Åpne **Kontakter** via Navi.
2. Opprett en ny kontakt. I demo-modus skjer dette lokalt uten API-kall, og en audit-toast dukker opp.
3. Demoen sender samtidig en hendelse til **Avtaler**-panelet. Åpne panelet for å se en fersk «Demoavtale foreslått …»-banner.
4. Trykk **Audit** for å lese WhyDrawer-sammendraget av hvorfor avtalen ble foreslått.
5. Test angre-flyten ved å trykke **Angre** i toasten. Avtalen fjernes og audit-panel og banner lukkes.

## Flow 2 – Workspace og O365

1. Slå på demo-modus slik at **Google Workspace**- og **O365**-kortene vises i Navi.
2. Åpne Google Workspace-panelet for å se siste dokumenter, eier og oppdateringstid.
3. Bruk **Audit**-knappen for å lese forklaringen på hvorfor elementene er prioritert.
4. Åpne deretter **O365**-panelet og trykk **Hvorfor** for å vise eksisterende WhyDrawer med Outlook/SharePoint-utkast.

Begge flytene kan repeteres fritt. Demo-modus endrer kun lokal tilstand og påvirker ikke persistente data eller nettverkskall.
