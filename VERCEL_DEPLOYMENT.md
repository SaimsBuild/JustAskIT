# Deploying JustAskIT to Vercel

## Prerequisites
1. A Vercel account (sign up at https://vercel.com)
2. OpenRouter API key (get one at https://openrouter.ai)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   - Create a new repository on GitHub
   - Push your code:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin YOUR_GITHUB_REPO_URL
     git push -u origin main
     ```

2. **Import to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure the project:
     - **Framework Preset:** Other
     - **Root Directory:** ./
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist/public`

3. **Add Environment Variables**
   - In the import screen, click "Environment Variables"
   - Add: `OPENROUTER_API_KEY` with your OpenRouter API key
   - Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variable**
   ```bash
   vercel env add OPENROUTER_API_KEY
   ```
   - Paste your OpenRouter API key when prompted
   - Select "Production", "Preview", and "Development"

5. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

## After Deployment

1. Your app will be live at: `https://your-project-name.vercel.app`
2. The API endpoint will be: `https://your-project-name.vercel.app/api/chat`
3. Test the chat functionality to ensure it's working

## Troubleshooting

### Issue: "OpenRouter API key not configured"
- Make sure you added the `OPENROUTER_API_KEY` environment variable in Vercel
- Redeploy after adding environment variables

### Issue: API not responding
- Check the Vercel function logs in your dashboard
- Ensure the API key is valid
- Verify the serverless function isn't timing out (Vercel free tier has 10s limit)

### Issue: Frontend shows but API fails
- Check browser console for CORS or network errors
- Verify the API routes are working: visit `https://your-project-name.vercel.app/api/chat`

## Notes

- The free tier of Vercel has a 10-second timeout for serverless functions
- If responses take longer, consider upgrading to Vercel Pro
- Vercel automatically handles HTTPS/SSL certificates
- Environment variables need to be set in the Vercel dashboard for production

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify your OpenRouter API key is valid and has credits
