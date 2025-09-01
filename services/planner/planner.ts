import fs from "fs"; import path from "path";
const outDir = "services/planner/subtasks";
fs.mkdirSync(outDir, {recursive:true});
const iso = new Date().toISOString().replace(/[:]/g,"-");
const subtask = `title: "Improve README with generated sections"
acceptance:
  - "README.md contains auto sections"
risk: "low"
targets:
  - "tools/docgen/**"
  - "README.md"
`;
fs.writeFileSync(`${outDir}/${iso}-docgen.yaml`, subtask);
console.log("planner: wrote", `${outDir}/${iso}-docgen.yaml`);
