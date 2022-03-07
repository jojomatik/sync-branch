# sync-branch
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/jojomatik/sync-branch?sort=semver)](https://github.com/jojomatik/sync-branch/releases) [![GitHub](https://img.shields.io/github/license/jojomatik/sync-branch)](LICENSE) [![Build and publish](https://github.com/jojomatik/sync-branch/actions/workflows/publish.yml/badge.svg)](https://github.com/jojomatik/sync-branch/actions/workflows/publish.yml) 

Sync one branch to another

## Usage
```yml
name: Update another branch on each release
release:
  types:
    - published

jobs:
  sync_release_to_v1:
    if: ${{ startsWith(github.ref, 'refs/tags/v1') && !contains(github.ref, 'beta') }}
    name: Sync branch `main` to other branches (fast-forward enabled)
    runs-on: ubuntu-latest
    steps:
      - name: Keep `v1` up to date with `main` (fast-forward enabled)
        uses: jojomatik/sync-branch@v1
        with:
          source: "main" #optional, default: github.ref_name
          target: "v1" #optional, default: `beta`
          git_committer_name: ${{ secrets.BUMP_GIT_NAME }} #required
          git_committer_email: ${{ secrets.BUMP_GIT_EMAIL }} #required
          github_token: ${{ secrets.GH_TOKEN }} #optional, default: github.token
```

## Licensing
This project is licensed under the MIT License (MIT). See also [`LICENSE`](LICENSE).
