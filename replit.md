# SplitEase - Bill Splitting Application

## Overview

SplitEase is a modern bill splitting application that allows users to split expenses with friends using AI-powered bill scanning and automated payment processing. The application features a React frontend with a Node.js/Express backend, PostgreSQL database, and integrates with Google's Gemini AI for receipt analysis and Razorpay for payment processing.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend, backend, and data layers:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Node.js with Express, TypeScript-based API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session management
- **AI Integration**: Google Gemini AI for bill text/image extraction
- **Payment Processing**: Razorpay for handling payments and settlements

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database ORM**: Drizzle with Neon serverless PostgreSQL
- **Authentication**: Passport.js with OpenID Connect for Replit Auth
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **File Structure**: Modular route handlers and service layer separation

### Database Schema
The database uses the following main entities:
- **Users**: Profile information with Replit Auth integration
- **Friends**: Relationship management between users
- **Bills**: Main bill records with merchant and total information
- **Bill Items**: Individual line items within bills
- **Bill Participants**: Users involved in splitting a bill
- **Expense Splits**: How individual items are split between users
- **Payments**: Payment transactions and settlement records
- **Sessions**: Authentication session storage

### External Service Integrations
- **Google Gemini AI**: Receipt/bill image processing and data extraction
- **Razorpay**: Payment gateway for processing settlements
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Auth**: OAuth-based authentication system

## Data Flow

1. **User Authentication**: Users authenticate via Replit OAuth, sessions stored in PostgreSQL
2. **Bill Creation**: Users can manually create bills or use AI scanning to extract data from images
3. **AI Processing**: Images are sent to Gemini AI for merchant name, items, and total extraction
4. **Bill Splitting**: Users select friends to split bills with and specify individual item allocations
5. **Payment Processing**: Razorpay handles payment collection and settlement between users
6. **Balance Tracking**: System maintains running balances of who owes whom

## External Dependencies

- **@google/generative-ai**: Google Gemini AI integration for bill scanning
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **razorpay**: Payment gateway integration
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store
- **@radix-ui/***: Accessible UI primitive components
- **tailwindcss**: Utility-first CSS framework

## Deployment Strategy

The application is designed for deployment on Replit with the following characteristics:

- **Development**: Vite dev server with hot module replacement
- **Production**: Static frontend build served by Express
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Environment Variables**: Database URL, API keys, and session secrets
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Session Management**: PostgreSQL-backed sessions for scalability

## Changelog

- June 29, 2025. Initial setup
- June 29, 2025. Added Paytm wallet integration with balance display, transaction history, and payment method selection

## User Preferences

Preferred communication style: Simple, everyday language.
App Features: Show Paytm wallet balance prominently on home screen, integrate wallet payments for bill settlements.