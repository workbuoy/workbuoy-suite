# Signering & Notarisering (PR AF)
- macOS: `electron-builder.yml` har `notarize: true`. Legg til Apple-notarisering secrets i CI.
- Windows: `signAndEditExecutable: true` aktivert. Legg inn EV Code Signing i secrets.
- Linux: bygg signerte pakker (deb/rpm) etter behov.
