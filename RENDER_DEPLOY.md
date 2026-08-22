# Render Deployment

The app is configured as one Render Web Service. The Express server serves the production React build, API, and Socket.IO from one HTTPS domain.

1. Push this folder to a GitHub, GitLab, or Bitbucket repository.
2. In Render, select **New** > **Blueprint** and connect that repository. Render detects `render.yaml`.
3. Enter the required environment values marked as `sync: false` from `backend/.env.example`.
4. Set `FRONTEND_URL` to the deployed Render URL, for example `https://rishtaai.onrender.com`.
5. Deploy and open `https://<your-service>.onrender.com/health`. A successful response confirms the service is live.

For social login, update each provider's callback URL after deployment to:

`https://<your-service>.onrender.com/api/social/<provider>/callback`
