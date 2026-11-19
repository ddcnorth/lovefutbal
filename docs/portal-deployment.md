# Deploy the front page to DDCNorth

The portal space is **love.fútbol — Front page**, at
`https://ddcnorth.com/p/lovefutbal/`. Its repository is `ddcnorth/lovefutbal`.
It is separate from the existing **love.fútbol Atlas** space at `/p/lovefutbol/`.
Access and sharing are managed in [DDCNorth admin](https://ddcnorth.com/admin).

## Build and preview

Use Node.js 22 or later. Install the locked dependencies, then build:

```sh
npm ci
npm run build:portal
npm run preview:portal
```

Open the local preview at `/p/lovefutbal/`. The production entry contains only the
new front page. It has no prototype switcher or prototype route chunks.
`npm run build:prototypes` remains available for design review and writes to
`dist-prototypes/`, separately from the production `dist/` directory.

## Review and publish locally

```sh
npm run deploy:portal
```

The default is a dry run: it validates the build, lists its SHA-256 hashes and
destination, and makes no network requests. It rejects a build with the wrong
base path, missing index assets, or prototype navigation.

Commit and push the reviewed source to `main`. Set `CLOUDFLARE_API_TOKEN` in your
shell environment using your existing authorized secret-management process. The
token needs access to read and write objects in the portal's R2 bucket. Do not
commit the token or put it into a command saved in shell history.

```sh
npm run deploy:portal -- --publish
```

Publishing requires a clean `main` checkout matching GitHub's `main`. The script
rebuilds from that revision, uploads every file to its versioned directory,
reads every upload back to verify its SHA-256 hash, then activates the release by
writing `current.json` last. An upload failure leaves the current release active.
An already active revision is not overwritten. Run one publisher at a time;
the script checks for a changed release pointer before activation, but this REST
endpoint does not provide a documented conditional PUT lock.

The account and destination are deliberately fixed in the script:

| Setting | Value |
| --- | --- |
| Cloudflare account | `479e77f49d4ac5d7498529ee360f194b` |
| R2 bucket | `ddcnorth-portal-sites` |
| Build prefix | `sites/lovefutbal/<40-character Git commit>/` |
| Release pointer | `sites/lovefutbal/current.json` |
| Public path base | `/p/lovefutbal/` |

The pointer contains `version`, `repo`, `ref`, and `deployed_at`. The portal Worker
reads it to select the build and applies the space's private/public access and
cache policy. The script does not change space visibility, sharing, other sites,
the Worker, or DNS. Old version directories remain available for rollback.

After publishing, open the space in admin to see the deployed revision, then use
**Preview**. The portal may cache a release pointer for up to 30 seconds. Verify
the front page, scrolling, and mobile navigation before sharing it with a client.

## Portal registration and future automation

The DDCNorth portal must have a space with slug `lovefutbal` and repo
`ddcnorth/lovefutbal`. Registration is a one-time admin action. This local R2
publisher works with the existing portal serving contract and needs no Worker
redeployment or GitHub Actions runner.

The private `ddcnorth/portal` repository also has a `projects.json` registry used
to authorize GitHub OIDC deployment workflows. That registry is not used to
authorize local Cloudflare API uploads or to decide which admin spaces can be
served. If GitHub-based publishing is enabled later, register this exact
repository and its numeric owner/repository IDs there and use a separately
reviewed `deploy-portal.yml` workflow. No such workflow is required for the local
publisher documented here.

For rollback, use the Cloudflare account's normal authorized object-management
tool to restore a previously verified `current.json` value whose version directory
still exists. This does not alter the project's source or client access settings.

The uploader follows Cloudflare's [R2 object upload API](https://developers.cloudflare.com/api/resources/r2/subresources/buckets/subresources/objects/methods/upload/).
Object-key slashes remain literal in the URL; each other path segment is encoded.
