# Deployment & Handover Checklist

This document provides step-by-step instructions for deploying the Roberta Photography Portfolio and handing it over to the site owner.

## Current Status

The codebase is complete and ready for deployment. What remains:
- Configuration of external services (Tina Cloud, Netlify)
- Replacement of placeholder content with real content
- Domain setup

---

## Step 1: Create Tina CMS Account

Tina CMS provides the admin interface for editing content. Without this setup, the `/admin` panel won't work in production.

1. Go to [app.tina.io](https://app.tina.io) and create an account
2. Click **Create a New Project**
3. Connect your GitHub repository containing this code
4. Once connected, go to **Project Settings** > **Tokens**
5. Copy these values (you'll need them for Netlify):
   - **Client ID** (shown as `NEXT_PUBLIC_TINA_CLIENT_ID`)
   - **Content Token** (generate one if not exists - this is `TINA_TOKEN`)

---

## Step 2: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in/create account
2. Click **Add new site** > **Import an existing project**
3. Connect to GitHub and select this repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. **Before deploying**, click **Show advanced** and add environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_TINA_CLIENT_ID` | *(from Tina dashboard)* |
| `TINA_TOKEN` | *(from Tina dashboard)* |
| `NEXT_PUBLIC_TINA_BRANCH` | `main` |

6. Click **Deploy site**

---

## Step 3: Verify Deployment

After deployment completes:

1. Visit your Netlify URL (e.g., `https://your-site.netlify.app`)
2. Verify the site loads correctly
3. Go to `https://your-site.netlify.app/admin`
4. Log in with your Tina account
5. Verify you can edit content

---

## Step 4: Update Placeholder Content

Log into the admin panel (`/admin`) and update:

### Site Config
| Field | Current Value | Action |
|-------|---------------|--------|
| `email` | `hello@example.com` | Replace with real email |
| `profilePhoto` | *(empty)* | Upload actual photo |
| `bio` | Placeholder text | Write actual bio |
| `location` | `Los Angeles, CA` | Update if needed |

### Social Links
Update the URLs in Site Config > Social Links:
- Instagram: Real Instagram profile URL
- Pinterest: Real Pinterest profile URL
- LinkedIn: Real LinkedIn profile URL

### Projects
1. Delete `sample-project` or update it with real content
2. Add actual projects with:
   - Title and description
   - Cover image
   - Gallery images
   - Date
   - Featured flag (check for homepage display)

---

## Step 5: Configure Custom Domain (Optional)

In Netlify:
1. Go to **Domain settings**
2. Click **Add custom domain**
3. Follow DNS configuration instructions
4. Enable HTTPS (automatic with Netlify)

---

## Step 6: Contact Form Setup

The contact form is already configured to work with Netlify Forms. After deployment:

1. Submit a test message through the contact form
2. In Netlify, go to **Forms** to see submissions
3. Configure email notifications:
   - Go to **Site settings** > **Forms** > **Form notifications**
   - Add email notification for new submissions

---

## Credentials to Hand Over

The site owner will need access to:

| Service | Purpose | Access URL |
|---------|---------|------------|
| GitHub | Code repository | github.com |
| Netlify | Hosting, forms, domain | app.netlify.com |
| Tina CMS | Content editing | app.tina.io |

### Recommended: Create Separate Accounts

For a clean handover, have the site owner create their own accounts and transfer ownership:

1. **GitHub**: Transfer repository ownership or add as collaborator
2. **Netlify**: Transfer site to their team, or have them create account and redeploy
3. **Tina CMS**: Create project under their account

---

## Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `content/config/index.json` | All site settings, text, social links |
| `content/projects/*.mdx` | Project content files |
| `.env.example` | Template for environment variables |

### Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Build without Tina Cloud (local content only)
npm run build-local
```

### URLs

| URL | Purpose |
|-----|---------|
| `/` | Home page |
| `/projects` | All projects |
| `/about` | About page |
| `/contact` | Contact form |
| `/admin` | CMS admin panel |

---

## Troubleshooting

### Admin panel shows error
- Verify environment variables are set in Netlify
- Check that `NEXT_PUBLIC_TINA_BRANCH` matches your branch (usually `main`)
- Redeploy after adding/changing environment variables

### Contact form not working
- Only works after deploying to Netlify (not in local dev)
- Check Netlify Forms dashboard for submissions
- Verify the form has `data-netlify="true"` attribute

### Images not loading
- Ensure images are uploaded through the admin panel
- Check that `/public/uploads/` directory exists and is committed
- For large-scale sites, consider setting up Cloudinary (see README.md)

---

## Optional Enhancements

These are not required but can be added later:

- **Cloudinary**: Cloud image hosting for better performance (see README.md)
- **Google Analytics**: Add tracking code to `app/layout.tsx`
- **Custom 404 page**: Create `app/not-found.tsx`
- **Sitemap**: Add `next-sitemap` package for SEO
