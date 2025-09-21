# Merge Playbook: feature/persistence-roles-usage-caps

1. Opprett ny branch fra main:
   ```bash
   git checkout main
   git pull
   git checkout -b feature/persistence-roles-usage-caps
   ```

2. Kjør auto-resolve skriptet for å løse konfliktene:
   ```bash
   bash tools/resolve-conflicts.sh
   git add -A
   git commit -m "auto-resolve conflicts for persistence PR"
   ```

3. Push og opprett PR på GitHub med innhold fra PR_BODY/feature-persistence-roles-usage-caps.md
   ```bash
   git push origin feature/persistence-roles-usage-caps
   ```
