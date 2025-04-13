# eVote - Secure Pay-to-Vote Platform

A secure, real-time, feature-rich pay-to-vote eVoting platform tailored for school awards and event-based voting using Convex (backend/database) and a custom-built CMS/admin panel.

## Features

- **Multi-Department Support**: Each department manages its own voting sessions and nominees from a department-specific admin dashboard
- **Anonymous Pay-to-Vote System**: All voters are anonymous, and must pay a small token before they can cast a vote
- **Custom Admin Panel**: Department-level control over voting sessions, nominees, analytics, and result publishing
- **Real-time Analytics**: Track voting patterns, view charts, and generate reports in real-time
- **Secure Voting**: All voting and payment logic is handled server-side in Convex

## Tech Stack

### Frontend
- **Framework**: Next.js
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand

### Backend
- **Database & Serverless Functions**: Convex
- **Authentication**: Custom Auth (for department/admin only)
- **Storage**: Convex
- **Payments**: Paystack (mock implementation for demo)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/evote.git
cd evote
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up Convex:
```bash
npx convex dev
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to http://localhost:3000

## Usage

### Public Users
- Browse active voting events
- Select categories and nominees
- Pay to cast votes for their preferred nominees

### Department Admins
- Register a department
- Create and manage events
- Add voting categories and nominees
- View real-time voting statistics
- Monitor payment transactions

## Project Structure

- `/app`: Next.js app router pages
- `/components`: React components
- `/convex`: Convex backend functions and schema
- `/lib`: Utility functions and stores

## Core Modules

### Authentication
- Custom admin authentication system
- JWT-based authentication for admin actions

### Events Management
- Create and manage voting events
- Set voting dates and payment amounts
- Toggle event active status

### Voting System
- Anonymous pay-to-vote system
- Real-time vote tallying
- Payment processing and verification

### Analytics
- Vote breakdown by category and nominee
- Payment tracking and reporting

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Convex](https://www.convex.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Paystack](https://paystack.com/)
