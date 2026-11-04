import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import semanticRelease from "semantic-release";

type ReleasePlugin = string | [string, Record<string, unknown>];
type ReleaseConfig = { plugins: ReleasePlugin[] };

const require = createRequire(import.meta.url);
const config = require("../release.config.cjs") as ReleaseConfig;

async function checkReleaseNotes(): Promise<void> {
  const cwd = mkdtempSync(join(tmpdir(), "sync-branch-release-notes-"));
  const git = (...args: string[]): string =>
    execFileSync("/usr/bin/git", args, { cwd, encoding: "utf8" }).trim();

  try {
    git("init", "--initial-branch=main");
    git("config", "user.name", "Release notes check");
    git("config", "user.email", "release-check@example.invalid");
    git("config", "commit.gpgsign", "false");
    git("commit", "--allow-empty", "-m", "chore: initial release");
    git("tag", "v1.0.0");
    const repositoryUrl = pathToFileURL(cwd).href;
    git("remote", "add", "origin", repositoryUrl);

    for (const message of [
      "feat: add release-note fixture",
      "fix: correct release-note fixture",
      "perf: optimize release-note fixture",
      "build(deps): update release-note fixture dependency",
      "feat: remove legacy release-note fixture API\n\nBREAKING CHANGE: clients must provide a server identifier",
    ]) {
      git("commit", "--allow-empty", "-m", message);
    }

    const plugins = config.plugins.filter(
      (plugin): plugin is [string, Record<string, unknown>] =>
        Array.isArray(plugin) &&
        [
          "@semantic-release/commit-analyzer",
          "@semantic-release/release-notes-generator",
        ].includes(plugin[0]),
    );
    const result = await semanticRelease(
      {
        branches: ["main"],
        repositoryUrl,
        plugins,
        dryRun: true,
        ci: false,
      },
      { cwd, env: { PATH: "/usr/bin:/bin", HOME: process.env.HOME } },
    );

    assert.ok(result, "The dry run must produce a release");
    assert.equal(result.nextRelease.type, "major");
    assert.equal(result.nextRelease.version, "2.0.0");
    const notes = result.nextRelease.notes;
    assert.ok(notes, "The release must include notes");
    for (const text of [
      "Features",
      "add release-note fixture",
      "Bug Fixes",
      "correct release-note fixture",
      "Performance Improvements",
      "optimize release-note fixture",
      "Dependency updates",
      "update release-note fixture dependency",
      "BREAKING CHANGES",
      "clients must provide a server identifier",
    ]) {
      assert.ok(notes.includes(text), `Missing notes: ${text}`);
    }
    assert.equal(git("tag", "--list"), "v1.0.0");
    console.log("Release notes dry run passed for configured commit types.");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

try {
  await checkReleaseNotes();
} catch (error: unknown) {
  console.error(error);
  process.exitCode = 1;
}
