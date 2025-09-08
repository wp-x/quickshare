# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickShare is a Node.js/Express-based HTML code sharing tool with multi-user authentication and content management. It supports HTML, Markdown, SVG, and Mermaid diagram sharing with password protection and admin management features.

## Core Architecture

### Application Structure
- **Entry Point**: `app.js` - Main Express application with middleware setup
- **Configuration**: `config.js` - Environment-specific configuration management
- **Routes**: 
  - `routes/pages.js` - Content creation and viewing endpoints
  - `routes/admin.js` - Administrative management interface
- **Models**: 
  - `models/db.js` - SQLite database initialization and schema
  - `models/pages.js` - Page data operations
- **Middleware**: `middleware/auth.js` - Authentication and authorization
- **Utilities**:
  - `utils/codeDetector.js` - Content type detection
  - `utils/contentRenderer.js` - Content rendering for different formats

### Authentication System
The application uses a two-tier permission system:
- **Admin users**: Full access including management dashboard, page deletion, statistics
- **Regular users**: Can create and share content but no admin access
- Authentication is handled via Express sessions with file-based storage

### Database
- Uses SQLite3 for data persistence
- Database file stored in `./data/` directory
- Schema includes pages table with title extraction and protection settings

## Development Commands

### Installation and Setup
```bash
npm install
```

### Running the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
# or
npm run prod

# Test mode
npm test
```

### Environment Configuration
Copy `.env.example` to `.env` and configure:
- `NODE_ENV`: development/production/test
- `PORT`: Application port (5678 for dev, 8888 for prod)
- `AUTH_ENABLED`: Enable/disable authentication
- `ADMIN_PASSWORD`: Admin user password
- `USER_PASSWORD`: Regular user password

### Docker Development
```bash
# Build and run with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Key Technical Details

### Content Types Supported
- **HTML**: Direct rendering with syntax highlighting
- **Markdown**: Parsed with marked.js
- **SVG**: Inline rendering
- **Mermaid**: Diagram generation with mermaid.js

### File Storage
- Session files: `./sessions/`
- Database: `./data/database.db`
- Uploaded content: Stored in database as TEXT

### Security Features
- Password-protected page sharing
- Session-based authentication
- Content sanitization for safe rendering
- File-based session storage to prevent memory leaks

### Performance Optimizations
- Memory limit set to 1024MB via `--max-old-space-size`
- Large file handling with 15MB limit for uploads
- Syntax highlighting disabled for very large files
- File-based session storage instead of memory

## Common Development Patterns

### Adding New Content Types
1. Extend `utils/codeDetector.js` for type detection
2. Add rendering logic in `utils/contentRenderer.js`
3. Update views if needed for display

### Route Authentication
Use middleware from `middleware/auth.js`:
- `isAuthenticated` - Requires any logged-in user
- `isAdmin` - Requires admin privileges

### Database Operations
All database operations go through `models/pages.js` with proper error handling and connection management.