module.exports = {
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          { type: "build", scope: "deps", release: "patch" },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            {
              type: "feat",
              section: "Features",
              hidden: false,
            },
            {
              type: "fix",
              section: "Bug Fixes",
              hidden: false,
            },
            {
              type: "perf",
              section: "Performance Improvements",
              hidden: false,
            },
            {
              type: "build",
              scope: "deps",
              hidden: false,
              section: "Dependency updates",
            },
          ],
        },
      },
    ],
    "@semantic-release/github",
  ],
  branches: [
    "+([0-9])?(.{+([0-9]),x}).x",
    "main",
    "next",
    "next-major",
    { name: "beta", prerelease: true },
    { name: "alpha", prerelease: true },
  ],
};
