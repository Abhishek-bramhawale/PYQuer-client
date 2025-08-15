
# PYQuer Client 

A React client where users can upload previous year question papers and get the analysis results.

## Features

- PDF upload (multiple files)
- Auth (login/register) with JWT
- Analysis viewer with repeated/differences/diagram sections
- History view for authenticated users

## Requirements

- Node.js 18+ and npm
- A running PYQuer server 

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Configure environment

- The client reads the backend URL from `REACT_APP_API_BASE_URL`.
- Defaults to `https://pyquer-server.onrender.com` if not set.

Create `.env` in `client/` (optional):
```env
REACT_APP_API_BASE_URL=https://your-backend-url
```

3) Run development server
```bash
npm start
```

4) Build for production
```bash
npm run build
```

## Configuration Notes

- File `src/config/api.js` controls API endpoints. Set `REACT_APP_API_BASE_URL` to point to your backend.
- A proxy to `http://localhost:5000` exists in `package.json`. When using `REACT_APP_API_BASE_URL`, this proxy is bypassed.

## CI/CD (Vercel)

This repo includes a GitHub Actions workflow to deploy the client to Vercel when changes are pushed to `client/`.

1) In Vercel, create a Project and connect your repository 
2) Add the following GitHub repository secrets:
   - `VERCEL_TOKEN`: Vercel token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID_CLIENT`: The Vercel Project ID for this client

The workflow at `.github/workflows/deploy-client-vercel.yml` will:
- Install deps in `client/`
- Deploy to Vercel using the above secrets

## Scripts

- `npm start` – start dev server
- `npm run build` – create production build
- `npm test` – run tests


The application is designed to work with the pyquer backend service. Make sure the backend service is running and properly configured before using the client application. Github link of server repo is - https://github.com/Abhishek-bramhawale/PYQuer-server