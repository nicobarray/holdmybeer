#! /usr/bin/env node

const parseArgs = require("minimist");
const path = require("path");
const { v4 } = require("uuid");
const fs = require("fs-extra");
const execa = require("execa");
const ora = require("ora");

const argv = parseArgs(process.argv.slice(2));

const url = argv["u"] || argv["url"] || "github.com";
const project = argv["p"] || argv["project"] || "yahwastaken/holdmybeer";
const branch = argv["b"] || argv["branch"] || "master";
const scope = argv["s"] || argv["scope"] || null;
const otp = argv["otp"] || null;
const forceVersion = argv["fv"] || argv["forceVersion"] || null;

const remote = `git@${url}:${project}`;
const root = path.join("/", "tmp", v4());
const cloneDir = path.join(root, project);
const packagePath = path.join(cloneDir, "package.json");
const name = scope
  ? `${scope}/${project.split("/")[1] || project}`
  : project.split("/")[1] || project;

const spinner = ora(`Hold my beer one sec...`);

async function main() {
  console.log(
    JSON.stringify(
      {
        options: {
          url,
          project,
          branch,
          scope,
          forceVersion,
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

  spinner.start();

  spinner.text = `1/8 Creating temporary dir ${root}`;

  await fs.emptydir(root);

  spinner.text = `2/8 Cloning ${remote}`;

  try {
    await execa("git", ["clone", remote, cloneDir]);
  } catch (err) {
    console.log(`[holdmybeer] Error: Cannot clone ${remote} to ${cloneDir}`);
    spinner.stop();
    return;
  }

  spinner.text = `3/8 Fetching and checking out branch ${branch}`;

  try {
    await execa.shell(`cd ${cloneDir} && git checkout ${branch}`);
  } catch (err) {
    console.log(
      `[holdmybeer] Error: Cannot checkout branch ${branch} > ${err}`
    );
    spinner.stop();
    return;
  }

  spinner.text = `4/8 Adding scope to package.json`;

  const package = await fs.readJson(packagePath);

  package.name = name;

  spinner.text = `5/8 Adding version to package.json`;

  if (forceVersion) {
    package.version = forceVersion;
  } else {
    let version = null;
    try {
      const { stdout } = await execa.shell(`npm view ${package.name} version`);
      version = stdout;
    } catch (err) {
      version = package.version;
    }

    const [packageVersion, scoppedVersion] = version.split("-");
    const scopeWithoutAt = scope ? scope.substr(1) : "fork";

    if (!scoppedVersion) {
      package.version = `${packageVersion}-${scopeWithoutAt}.1`;
    } else {
      const subVersionId = parseInt(scoppedVersion.split(".")[1], 10);
      package.version = `${packageVersion}-${scopeWithoutAt}.${subVersionId +
        1}`;
    }
  }

  await fs.writeJson(packagePath, package);

  spinner.text = `6/8 Installing node_modules...`;

  const useYarn = await fs.pathExists(path.join(cloneDir, "yarn.lock"));
  const installCmd = useYarn ? "yarn" : "npm install";

  await execa.shell(`cd ${cloneDir} && ${installCmd}`);

  spinner.text = `7/8 Releasing package ${name}`;

  await execa.shell(
    `cd ${cloneDir} && npm publish --access public ${otp ? `--otp ${otp}` : ""}`
  );

  spinner.text = `8/8 Clearing tmps...`;

  await fs.remove(root);

  spinner.stop();
}

process.on("uncaughtException", err => {
  console.log(`[holdmybeer] Global Error: ${err}`);
  spinner.stop();
});

main();
