import fs from "fs"; import path from "path"; import child_process from "child_process";
const subDir = "services/planner/subtasks";
const patchFile = "patch.diff";
if (!fs.existsSync(subDir)) process.exit(0);
const subtasks = fs.readdirSync(subDir).filter(f=>f.endsWith(".yaml"));
if (subtasks.length===0) process.exit(0);

// Demo: append a line to README if allowed
const readme = "README.md";
if (fs.existsSync(readme)) {
  fs.appendFileSync(readme, "\n\n> Auto line from builder (demo)\n");
  // produce a patch
  child_process.execSync(`git diff -- README.md > ${patchFile}`);
  console.log("builder: patch at", patchFile);
} else {
  console.log("builder: README.md not found, skipping");
}
