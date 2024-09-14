# Video Analysis Project

## Course Information

This project is part of the AI Video Analysis with Google Gemini course offered by Neuronest. You can find more information about the course at:

[https://app.neuronest.live/course/ai-video-analysis-google-gemini](https://app.neuronest.live/course/ai-video-analysis-google-gemini)

## Project Description

This project is a Next.js application that allows users to upload short video clips and analyze them using Google's Gemini AI via Firebase. The application provides a user-friendly interface for video upload, displays a progress indicator, and presents the AI-generated analysis results.

## Technologies Used

- Next.js
- React
- Firebase (Storage, Firestore, and Vertex AI)
- Tailwind CSS
- Framer Motion

## Prerequisites

- Node.js (version 18.17.0 or later)
- npm (version 9.0.0 or later)
- A Firebase account

## Setup

1. Clone this repository to your local machine.

2. Create a Firebase project and obtain the necessary configuration.

3. Create a `.env.local` file in the root directory of the project and add the following environment variables with your Firebase configuration:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Install the project dependencies:

   ```bash
   npm install
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Troubleshooting

If you encounter any issues during setup or while running the application, please refer to the FAQ section in the course materials. For additional support, you can reach out to support@neuronest.live.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.