import fs from "fs";
import path from "path";

function scanRepo() {
  const data = {
    workflows: [], helm: [], packages: [], env: [],
  };
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(p); continue; }
      const rel = p.replace(process.cwd()+path.sep,"");
      if (rel.startsWith(".github/workflows/")) data.workflows.push(rel);
      if (rel.includes("/helm/") || rel.startsWith("ops/helm/")) data.helm.push(rel);
      if (rel.endsWith("package.json")) data.packages.push(rel);
      if (rel.match(/(values\.(stage|prod)\.ya?ml|\.env|secrets)/)) data.env.push(rel);
    }
  }
  walk(process.cwd());
  return data;
}

function renderReadme(d:any) {
  return `# WorkBuoy – Auto Docs

## Workflows
${d.workflows.map((w:string)=>`- ${w}`).join("\n")}

## Helm
${d.helm.map((w:string)=>`- ${w}`).join("\n")}

## Packages
${d.packages.map((w:string)=>`- ${w}`).join("\n")}
`;
}

const data = scanRepo();
fs.writeFileSync("README.md", renderReadme(data));
