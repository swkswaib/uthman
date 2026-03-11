# Responsive Dashboard

A modern, fully responsive dashboard application built with React. Features a clean UI with a collapsible sidebar, interactive navigation, and adaptive layouts for desktop, tablet, and mobile devices.

## Features

- **Responsive Design**: Seamlessly adapts to all screen sizes (desktop, tablet, mobile)
- **Interactive Sidebar**: Collapsible navigation with quick actions and recent activity
- **Modern UI Components**:
  - Dynamic navbar with search functionality
  - Stats cards with metrics and trends
  - Projects table with progress tracking
  - Activity feed and charts
- **Mobile-Friendly**: Touch-optimized with hamburger menu and overlay sidebar
- **Clean Architecture**: Component-based structure with separate CSS modules

## Project Structure

```
responsive-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Navbar.css
│   │   ├── Sidebar.jsx
│   │   ├── Sidebar.css
│   │   ├── ContentSection.jsx
│   │   └── ContentSection.css
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Technologies Used

- **React 18** - UI library
- **CSS3** - Styling with CSS custom properties
- **Font Awesome 6** - Icon library
- **Google Fonts (Inter)** - Typography

## Responsive Breakpoints

- **Desktop**: > 768px - Full sidebar and navigation
- **Mobile**: ≤ 768px - Collapsible sidebar with overlay

## Key Components

### Navbar

- Responsive navigation bar with logo
- Search functionality
- User profile and notifications
- Adaptive menu items

### Sidebar

- Main navigation menu
- Quick action buttons
- Recent activity feed
- Storage indicator
- Mobile overlay and close button

### Content Section

- Welcome header with CTA
- Stats cards grid
- Projects table with progress bars
- Charts and activity sections

## Customization

Colors and spacing can be customized in [src/App.css](src/App.css) using CSS custom properties:
