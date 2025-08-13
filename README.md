# WhatsApp Web Clone

A WhatsApp Web-like chat interface that displays real-time WhatsApp conversations using webhook data. The application mimics WhatsApp Web, shows chats neatly, and supports sending new messages (for storage only – no external sending).

## Features

- WhatsApp Web-like UI with responsive design
- Real-time message updates using WebSockets
- Chat list with conversation previews
- Message status indicators (sent, delivered, read)
- Support for different message types (text, image, video, audio, document, location)
- MongoDB integration for data storage
- Webhook payload processing

## Tech Stack

- **Frontend**: React, Tailwind CSS, Socket.io Client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB
- **Deployment**: Vercel (Frontend), Render (Backend)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### MongoDB Setup

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster
3. Create a database named `whatsapp`
4. Create a collection named `processed_messages`
5. Get your MongoDB connection string

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CLIENT_URL=http://localhost:5173
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_BACKEND_URL=http://localhost:5000
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Processing Webhook Payloads

1. Place your webhook payload JSON files in the `server/sample_payloads` directory
2. Run the webhook processing script:
   ```
   cd server
   npm run process-webhooks
   ```

## Deployment

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `npm install`
4. Set the start command: `npm start`
5. Add environment variables (PORT, MONGODB_URI, CLIENT_URL)
6. Deploy

### Frontend Deployment (Vercel)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set the framework preset to Vite
4. Add environment variables (VITE_BACKEND_URL)
5. Deploy

## License

MIT
