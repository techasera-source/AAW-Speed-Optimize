# AAW Speed Optimize

AAW Speed Optimize is a Shopify app designed to help merchants improve their storefront performance by optimizing assets, reducing page load times, and enhancing overall user experience.

## Features

- 🚀 Store speed optimization
- 📦 Asset optimization
- 🎨 Theme integration
- ⚡ Performance improvements
- 🔒 Secure Shopify OAuth authentication
- 🛍️ Shopify Admin embedded app

## Technology Stack

- Shopify CLI
- Remix
- React
- Node.js
- Prisma ORM
- Shopify App Bridge
- Polaris UI

## Requirements

- Node.js 18+
- npm or yarn
- Shopify Partner Account
- Shopify Development Store

## Installation

Clone the repository:

```bash
git clone https://github.com/techasera-source/AAW-Speed-Optimize.git
```

Go to the project directory:

```bash
cd AAW-Speed-Optimize
```

Install dependencies:

```bash
npm install
```

Configure your environment variables by creating a `.env` file.

Example:

```env
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_APP_URL=
SCOPES=
DATABASE_URL=
```

Run database migrations:

```bash
npx prisma migrate deploy
```

Start the development server:

```bash
npm run dev
```

## Deployment

This application can be deployed on any Node.js hosting provider such as:

- Render
- Railway
- DigitalOcean
- Fly.io
- AWS
- Google Cloud

A publicly accessible HTTPS URL is required for Shopify App installation.

## Shopify Configuration

Configure the following values in your Shopify Partner Dashboard:

- App URL
- Redirect URLs
- Required API Scopes
- Webhook Endpoints

## Project Structure

```
app/
extensions/
prisma/
public/
shopify.app.toml
package.json
```

## License

Copyright © 2026 Asera Tech.

All Rights Reserved.
