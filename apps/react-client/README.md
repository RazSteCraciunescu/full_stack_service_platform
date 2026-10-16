# React client

The primary framework client uses React, TypeScript, Bootstrap and Sass. It consumes the root Node API through Vite's development proxy.

```bash
# terminal 1, from the repository root
npm run build
npm start

# terminal 2
cd apps/react-client
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. Set `VITE_API_BASE_URL` only when the API is hosted on another origin.

The checked-in root preview does not require this dependency installation. It mirrors the same request workflow with plain browser JavaScript so reviewers can run the repository immediately.
