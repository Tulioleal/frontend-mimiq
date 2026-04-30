# Frontend Deployment

This frontend deploys as a Dockerized Next.js standalone server. The infra repository owns Artifact Registry and Cloud Run; this repository validates the app, builds the image, and pushes it to Artifact Registry.

## Runtime Configuration

The app now uses runtime server configuration for dynamic backend URLs.

Cloud Run should provide:

```text
BACKEND_API_BASE_URL=https://api.example.com
PUBLIC_WS_BASE_URL=wss://api.example.com
```

`BACKEND_API_BASE_URL` is used by the frontend same-origin REST proxy. Browser REST requests go to `/api/...` on the frontend origin, and Next.js forwards them server-side to the backend.

`PUBLIC_WS_BASE_URL` is exposed through:

```text
GET /api/runtime-config
```

The browser reads that endpoint before opening the generation WebSocket. This lets IaC change the WebSocket URL without rebuilding the frontend image.

Keep `NEXT_PUBLIC_API_BASE_URL` empty unless you intentionally want browser REST calls to bypass the frontend proxy and call the backend directly.

## Local Environment

```env
NEXT_PUBLIC_API_BASE_URL=
BACKEND_API_BASE_URL=http://localhost:8000
PUBLIC_WS_BASE_URL=ws://localhost:8000
```

## Local Verification

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build:container
```

`npm run build:container` does not require backend URL env vars. Backend URLs are runtime Cloud Run configuration.

## Local Docker Build

```bash
docker build -t pvc-frontend:local .
```

## Local Docker Run

```bash
docker run --rm \
  -e PORT=3000 \
  -e BACKEND_API_BASE_URL=http://host.docker.internal:8000 \
  -e PUBLIC_WS_BASE_URL=ws://localhost:8000 \
  -p 3000:3000 \
  pvc-frontend:local
```

The container runs as the non-root `nextjs` user and listens on Cloud Run's `PORT` environment variable.

## GitHub Actions Variables

Required repository variables:

```text
GCP_PROJECT_ID
GCP_REGION
ARTIFACT_REGISTRY_REPOSITORY
GCP_WORKLOAD_IDENTITY_PROVIDER
GCP_SERVICE_ACCOUNT
```

Optional repository variables:

```text
FRONTEND_IMAGE_NAME=frontend
NEXT_PUBLIC_API_BASE_URL=
```

`BACKEND_API_BASE_URL` and `PUBLIC_WS_BASE_URL` are not needed during image build because they are provided at Cloud Run runtime.

## Image Tags

Images are pushed to:

```text
<region>-docker.pkg.dev/<project-id>/<artifact-registry-repository>/<image-name>:<tag>
```

Use the immutable Git SHA tag for infra deployment:

```text
us-central1-docker.pkg.dev/my-gcp-project/pvc/frontend:<git-sha>
```

## Infra Handoff

After CI pushes an image, update the infra repo production value:

```hcl
frontend_image = "us-central1-docker.pkg.dev/my-gcp-project/pvc/frontend:<git-sha>"
```

Cloud Run runtime env should include:

```hcl
frontend_env = {
  BACKEND_API_BASE_URL = "https://api.example.com"
  PUBLIC_WS_BASE_URL   = "wss://api.example.com"
}
```

For first Cloud Run creation:

```hcl
frontend_enabled = true
frontend_public  = false
```

Only set `frontend_public = true` after the frontend is ready for unauthenticated public access.

## Backend Coordination

- Backend CORS should allow the frontend Cloud Run origin or custom domain.
- Frontend REST auth uses same-origin frontend cookies through the proxy.
- Browser WebSockets cannot send custom `X-Admin-Key` headers. WebSocket auth still depends on a backend-domain cookie, shared-site deployment, or a future agreed WebSocket auth mechanism.
- HTTPS frontend deployments must use `wss://` for `PUBLIC_WS_BASE_URL`.
