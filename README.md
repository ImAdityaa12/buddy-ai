# 🚀 AI Meeting Platform

A modern, full-stack meeting platform built with Next.js that combines video calling, AI agents, and seamless authentication. Create, manage, and join meetings with AI-powered assistance and beautiful, responsive design.

## ✨ Features

-   **🎥 Video Calling**: High-quality video meetings powered by Stream Video API
-   **🤖 AI Agents**: Intelligent meeting assistants with customizable avatars
-   **🔐 Authentication**: Secure login with GitHub and Google OAuth
-   **💬 Real-time Chat**: Integrated chat functionality during meetings
-   **🎨 Modern UI**: Beautiful interface built with shadcn/ui and Tailwind CSS
-   **📱 Responsive Design**: Works seamlessly across all devices
-   **🔍 Advanced Search**: Smart filtering and search capabilities
-   **⚡ Real-time Updates**: Live data synchronization with tRPC

## 🛠️ Tech Stack

-   **Framework**: Next.js 14 with App Router
-   **Styling**: Tailwind CSS + shadcn/ui components
-   **Authentication**: Better Auth with OAuth providers
-   **Database**: PostgreSQL (Neon)
-   **Video/Chat**: Stream Video & Chat APIs
-   **State Management**: tRPC + TanStack Query
-   **AI Integration**: OpenAI API
-   **Avatar Generation**: DiceBear
-   **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   npm/yarn/pnpm/bun
-   PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**

    ```bash
    git clone <your-repo-url>
    cd <project-name>
    ```

2. **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3. **Set up environment variables**

    Copy `.env.example` to `.env` and fill in your credentials:

    ```env
    # Database
    DATABASE_URL=your_postgresql_connection_string

    # Authentication
    BETTER_AUTH_SECRET=your_auth_secret
    BETTER_AUTH_URL=http://localhost:3000

    # OAuth Providers
    GITHUB_CLIENT_ID=your_github_client_id
    GITHUB_CLIENT_SECRET=your_github_client_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # App Configuration
    NEXT_PUBLIC_APP_URL=http://localhost:3000

    # Stream APIs
    NEXT_PUBLIC_STREAM_VIDEO_API_KEY=your_stream_video_key
    STREAM_VIDEO_API_SECRET=your_stream_video_secret
    NEXT_PUBLIC_STREAM_CHAT_API_KEY=your_stream_chat_key
    STREAM_CHAT_SECRET_KEY=your_stream_chat_secret

    # AI Integration
    OPENAI_API_KEY=your_openai_api_key

    # Additional Services
    POLAR_ACCESS_TOKEN=your_polar_token
    ```

4. **Run the development server**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

5. **Open your browser**

    Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   ├── command-select.tsx # Custom select component
│   ├── empty-state.tsx    # Empty state component
│   └── ...
├── lib/                   # Utility functions and configurations
├── modules/               # Feature-specific modules
│   └── meeting/          # Meeting-related components
├── hooks/                 # Custom React hooks
└── trpc/                 # tRPC configuration and routers
```

## 🔧 Configuration

### Authentication Setup

1. **GitHub OAuth**:

    - Go to GitHub Settings > Developer settings > OAuth Apps
    - Create a new OAuth App with callback URL: `http://localhost:3000/api/auth/callback/github`

2. **Google OAuth**:
    - Visit Google Cloud Console
    - Create OAuth 2.0 credentials with redirect URI: `http://localhost:3000/api/auth/callback/google`

### Stream Setup

1. Create a Stream account at [getstream.io](https://getstream.io)
2. Get your API keys from the dashboard
3. Add them to your `.env` file

### Database Setup

1. Create a PostgreSQL database (Neon recommended)
2. Add the connection string to `DATABASE_URL`
3. Run database migrations (if applicable)

## 🎨 UI Components

This project uses a custom design system built on top of shadcn/ui:

-   **CommandSelect**: Advanced select component with search functionality
-   **GeneratedAvatar**: Dynamic avatar generation using DiceBear
-   **EmptyState**: Consistent empty state presentations
-   **LoadingState**: Beautiful loading indicators

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   [Next.js](https://nextjs.org) for the amazing framework
-   [shadcn/ui](https://ui.shadcn.com) for the beautiful components
-   [Stream](https://getstream.io) for video/chat infrastructure
-   [Better Auth](https://better-auth.com) for authentication
-   [tRPC](https://trpc.io) for type-safe APIs

---

Built with ❤️ using Next.js and modern web technologies.
