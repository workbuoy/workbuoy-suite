# QA – WorkBuoy Desktop

## Røyk-test
1. Installer bygget pakke for din plattform.
2. Bekreft at appen starter og viser WorkBuoy splash.
3. Sett `CHANNEL=beta` og bekreft at auto-update check kjører.

## Auto-update test (lokal feed)
1. Start en enkel HTTP-server med en ny `.yml` + binær.
2. Sett `CHANNEL=beta` og pek til serveren.
3. Bekreft at auto-update trigger nedlasting og installasjon.

## Tilbakemelding
Rapporter funn i GitHub Issues under `desktop-build`.
