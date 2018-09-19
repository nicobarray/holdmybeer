const parseArgs = require("minimist");
const path = require("path");
const { v4 } = require("uuid");
const fs = require("fs-extra");
const execa = require("execa");

const argv = parseArgs(process.argv.slice(2));

const url = argv["u"] || argv["url"] || "github.com";
const project = argv["p"] || argv["project"] || "yahwastaken/holdmybeer";
const branch = argv["b"] || argv["branch"] || "master";
const scope = argv["s"] || argv["scope"] || "@nbarray";
const otp = argv["otp"] || null;

const remote = `git@${url}:${project}`;
const root = path.join("/", "tmp", v4());
const cloneDir = path.join(root, project);
const packagePath = path.join(cloneDir, "package.json");
const name = `${scope}/${project.split("/")[1] || project}`;

async function main() {
  console.log(
    JSON.stringify(
      {
        options: {
          url,
          project,
          branch,
          scope,
          otp
        },
        computed: {
          remote,
          root,
          cloneDir,
          name
        }
      },
      null,
      2
    )
  );

  console.log(`[holdmybeer] 1. Create temporary dir ${root}`);

  await fs.emptydir(root);

  console.log(`[holdmybeer] 2. Clone ${remote}`);

  try {
    await execa("git", ["clone", remote, cloneDir]);
  } catch (err) {
    console.log(`[holdmybeer] Error: Cannot clone ${remote} to ${cloneDir}`);
  }

  console.log(`[holdmybeer] 3. Checkout branch ${branch}`);

  try {
    await execa("git", ["checkout", branch]);
  } catch (err) {
    console.log(`[holdmybeer] Error: Cannot checkout branch ${branch}`);
  }

  console.log(`[holdmybeer] 4. Add scope to package.json`);

  const package = await fs.readJson(packagePath);

  await fs.writeJson(packagePath, {
    ...package,
    name
  });

  console.log(`[holdmybeer] 5. Release package ${name}`);

  await execa.shell(
    `cd ${cloneDir} && npm publish --access public ${otp ? `--otp ${otp}` : ""}`
  );

  console.log(`[holdmybeer] 6. Clearing tmps...`);

  await fs.remove(root);
}

process.on("uncaughtException", err => {
  console.log(`[holdmybeer] Global Error: ${err}`);
});

main();
