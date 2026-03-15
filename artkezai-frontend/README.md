# Artkezai Frontend

A Next.js 14 frontend for Artkezai, an online marketplace for original paintings.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query v5) & Axios
- **UI Components**: Lucide React
- **Notifications**: React Hot Toast
- **Payment**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file with required variables:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── gallery/           # Gallery pages
│   ├── painting/          # Painting detail page
│   ├── artists/           # Artists directory
│   ├── auth/              # Auth pages (login, register)
│   ├── dashboard/         # Buyer dashboard
│   ├── artist/            # Artist dashboard
│   └── admin/             # Admin console
├── components/            # Reusable React components
│   ├── layout/           # Header, Footer
│   ├── gallery/          # Gallery related components
│   ├── painting/         # Painting detail components
│   ├── offer/            # Offer components
│   ├── messaging/        # Messaging components
│   └── providers/        # Context/Provider components
├── lib/
│   ├── api.ts            # Axios client setup
│   ├── api/              # API service methods
│   ├── store/            # Zustand stores
│   └── hooks/            # Custom React Query hooks
└── types/                # TypeScript types/interfaces
```

## Key Features

### Buyer Dashboard
- Browse and filter paintings
- Make offers on paintings
- Track orders and shipments
- View offer status and history
- Message with artists and admin

### Artist Dashboard
- Submit paintings for sale
- Manage listings (draft, under review, live, sold)
- Respond to buyer offers
- Track sales and earnings
- Update artist profile and story

### Admin Console
- Review and approve/reject paintings
- Manage offers and counter offers
- Process orders and shipping
- View system statistics
- User and content management

## API Integration

The frontend connects to the Artkezai backend API at `http://localhost:8080/api`.

### Authentication Flow
- Credentials stored in Zustand auth store
- Persisted to localStorage
- JWT token sent in Authorization header
- Auto-redirect to login on 401 responses

### Query Management
- React Query caches queries
- Optimistic updates for mutations
- Toast notifications for success/error
- Automatic refetching on mount

## Component Conventions

- All client-side components have `'use client'` directive
- Server components for SEO (painting detail, artist profile)
- Tailwind CSS classes for styling
- Brand colors: `#1A1A2E` (brand), `#C9A84C` (accent)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |

## Development Tips

- Use Tailwind's `@apply` directive for reusable styles
- Handle loading/error states in all data-fetching components
- Use `next/image` for all images for optimization
- Follow the existing folder structure for new features
- Add TypeScript types for all props and state

## Building & Deployment

### Production Build

```bash
npm run build
```

### Deployment

The frontend can be deployed to:
- Vercel (recommended for Next.js)
- AWS Amplify
- GitHub Pages
- Docker container
- Traditional Node.js server

## Troubleshooting

### API Connection Issues
- Ensure backend is running on `http://localhost:8080`
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify CORS headers in backend

### Authentication Issues
- Clear localStorage and browser cookies
- Ensure token is being stored correctly
- Check JWT expiration

### Image Loading Issues
- Verify MinIO/S3 is running and accessible
- Check image URLs in response
- Ensure `next.config.ts` includes correct image domains

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - Artkezai
