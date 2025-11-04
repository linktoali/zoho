# Pizza Ordering Website

## Overview
A full-stack pizza ordering website built with React (Vite) frontend and Node.js/Express backend. Users can browse pizzas, add them to cart, and place orders with delivery information.

## Features
1. **Homepage**: Displays a grid of available pizzas with images, names, descriptions, and prices
2. **Add to Cart**: Each pizza card has an "Add to Cart" button
3. **Cart Page**: Shows all added pizzas with quantity controls, subtotal, and total
4. **Checkout Page**: Form with fields for:
   - Full Name
   - Email
   - Delivery Address (optional for pickup)
   - Phone Number
   - Payment Method (3 options):
     * Cash on Delivery
     * Pay on Pickup
     * Online Payment (Square integration)
5. **Square Payment Integration**: Fully integrated Square Web Payments SDK for secure online payments
6. **Order Confirmation**: Shows order details, payment status, and success message after placing order
7. **Data Storage**: Orders are stored in-memory on the backend server

## Tech Stack
- **Frontend**: React 18, React Router, Vite
- **Backend**: Node.js, Express
- **Styling**: Pure CSS (no frameworks)
- **State Management**: React useState/props

## Project Structure
```
├── server/
│   └── index.js          # Express backend API
├── src/
│   ├── components/
│   │   ├── Navbar.jsx    # Navigation bar with cart count
│   │   └── PizzaCard.jsx # Individual pizza card component
│   ├── pages/
│   │   ├── HomePage.jsx       # Pizza list page
│   │   ├── CartPage.jsx       # Shopping cart page
│   │   ├── CheckoutPage.jsx   # Checkout form
│   │   └── OrderSuccessPage.jsx # Order confirmation
│   ├── App.jsx           # Main app with routing and cart state
│   └── main.jsx          # React entry point
├── index.html
├── vite.config.js
└── package.json
```

## API Endpoints
- `GET /api/pizzas` - Get all available pizzas
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order details by ID

## Development
- Frontend runs on port 5000 (0.0.0.0)
- Backend runs on port 3001 (localhost)
- Workflow: `npm run dev` (runs both servers concurrently)

## Deployment
- Type: Autoscale
- Build: `npm run build`
- Run: Backend server + Vite preview on port 5000

## Square Payment Setup
To enable Square online payments, you need to set up Square credentials:

1. Create a Square Developer account at https://developer.squareup.com/
2. Create a new application
3. Get your credentials:
   - **Application ID** (for frontend)
   - **Access Token** (for backend)
   - **Location ID** (from your Square account)
4. Add the credentials as environment secrets (NOT in .env file)

Required environment variables:
- `SQUARE_ACCESS_TOKEN` - Backend access token
- `SQUARE_LOCATION_ID` - Your Square location ID  
- `VITE_SQUARE_APP_ID` - Frontend application ID (must start with VITE_)
- `VITE_SQUARE_LOCATION_ID` - Your Square location ID (must start with VITE_)

## Recent Changes
- November 4, 2025: Initial project setup
- Removed MongoDB dependency and implemented in-memory storage per user request
- Configured Vite to allow all hosts for Replit proxy compatibility
- Added three payment methods: Cash on Delivery, Pay on Pickup, Online Payment (Square)
- Integrated Square Web Payments SDK for secure credit card processing
- Updated backend to handle Square payment API calls
