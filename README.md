# Roberta Photography Portfolio

A minimal, elegant photography portfolio built with Next.js and Tina CMS.

## Features

- Clean, minimal design with warm neutral tones
- Project galleries with lightbox viewer
- Fully editable through Tina CMS admin interface
- Responsive layout for all devices
- Optimized image loading

## Local Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd roberta-personal-site
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

## Content Management

### Editing Content

1. Navigate to `/admin` on your site
2. Log in (if using Tina Cloud) or edit directly (local mode)
3. Select the content type you want to edit:
   - **Site Config**: Update site name, bio, profile photo, contact info
   - **Projects**: Add/edit photography projects with galleries
   - **Pages**: Edit page content

### Adding a New Project

1. Go to Admin > Projects > Add New
2. Fill in:
   - **Title**: Project name
   - **Slug**: URL-friendly name (e.g., "wedding-photos")
   - **Description**: Brief project description
   - **Cover Image**: Main image shown in project listings
   - **Images**: Gallery images for the project
   - **Date**: Project date
   - **Featured**: Check to show on home page

## Connecting to Tina Cloud

For production editing capabilities:

1. Create an account at [tina.io](https://tina.io)

2. Create a new project and connect your repository

3. Add these environment variables to your hosting platform:
   ```
   NEXT_PUBLIC_TINA_CLIENT_ID=<your-client-id>
   TINA_TOKEN=<your-token>
   NEXT_PUBLIC_TINA_BRANCH=main
   ```

4. Deploy your site

## Setting Up Cloudinary (Optional)

For cloud-based image storage:

1. Create a [Cloudinary](https://cloudinary.com) account

2. Get your cloud name and API credentials

3. Update `tina/config.js` to enable Cloudinary:
   ```javascript
   media: {
     loadCustomStore: async () => {
       const pack = await import("next-tinacms-cloudinary");
       return pack.TinaCloudCloudinaryMediaStore;
     },
   },
   ```

4. Add environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   ```

## Deploying to Netlify

1. Push your code to GitHub/GitLab/Bitbucket

2. Connect repository to Netlify

3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

4. Add environment variables (see Tina Cloud section)

5. Deploy!

## Project Structure

```
├── app/                    # Next.js pages
├── components/             # React components
├── content/                # CMS content files
├── tina/                   # Tina CMS configuration
└── public/                 # Static assets
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build-local` | Build without Tina Cloud |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Customization

### Colors
Edit the color variables in `app/globals.css`:
```css
@theme {
  --color-cream: #FAF8F5;
  --color-warm-gray: #3D3D3D;
  --color-accent: #C4A484;
}
```

### Typography
The site uses Inter font. Modify in `app/layout.tsx`.

## Learn More

- [Tina CMS Docs](https://tina.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
