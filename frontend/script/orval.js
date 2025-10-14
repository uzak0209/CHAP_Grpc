import fs from "fs";
import path from "path";

const targets = [
  "auth",
  "user",
  "post",
  "comment",
  "thread",
  "event",
  "spot",
  "image",
];

for (const name of targets) {
  const targetPath = path.resolve(`./src/api/${name}.ts`);
  if (!fs.existsSync(targetPath)) continue;

  let content = fs.readFileSync(targetPath, "utf8");
  // './' を './<name>.schemas' に置換
  content = content.replace(/from '\.\/';?/g, `from './${name}.schemas.ts';`);
  fs.writeFileSync(targetPath, content);
  console.log(`✅ fixed import in ${name}.ts`);
}