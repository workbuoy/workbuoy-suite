# PR AF: Signering & Notarisering – Desktop

## Innhold
- Workflows: `.github/workflows/desktop-signing.yml`
- Scripts: `scripts/build_desktop_artifacts.sh`, `scripts/build_desktop_artifacts.ps1`, `scripts/macos_sign_notarize.sh`, `scripts/windows_sign.ps1`, `scripts/linux_sign.sh`
- Docs: `docs/DESKTOP_SIGNING.md`

## Bruk
- Kjør GitHub Actions workflow **desktop-signing** (manuelt eller ved push).
- Last ned artefakter for mac/win/linux fra workflow-run.

## Aksept
- macOS: signert (og notarized hvis secrets finnes), artefakter lastet opp.
- Windows: signert `.exe` og ZIP lastet opp.
- Linux: checksums + GPG-signatur (hvis nøkkel).

## Rollback
- Deaktiver workflow eller fjern secrets. Artefakter forblir upåvirket.
