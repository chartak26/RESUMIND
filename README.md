 RESUMIND — AI Resume Analyzer
RESUMIND is an AI-powered resume analysis tool built with React.js and TypeScript that helps job seekers optimize their resumes for ATS (Applicant Tracking Systems). Simply upload your resume in PDF format, enter the job details, and get instant intelligent feedback tailored to the role you're applying for — all powered by Puter.js built-in AI.
🌐 Website
Feel free to test the application here:
Visit RESUMIND

✨ Features

🔐 Secure authentication powered by Puter.js
📄 PDF resume upload with internal PDF-to-image conversion
🏢 Job-specific analysis using company name, role & job description
🤖 AI-powered keyword matching and ATS score generation
⚠️ Concern points highlighting weak or missing resume sections
🛠️ Detailed issue detection for skills, phrasing & formatting problems
⚡ Instant real-time feedback with a clean readable breakdown
📱 Fully responsive modern UI


🛠 Technologies
Frontend

React.js
TypeScript
Tailwind CSS

AI & Services

Puter.js (Authentication + Built-in AI)
PDF-to-Image Conversion
ATS Keyword Matching Engine

Tools

Git & GitHub
Vercel (Deployment)


⚙️ Local Development
To run RESUMIND locally for development, follow these steps:
Clone the Repository
git clone https://github.com/chartak26/RESUMIND.git
⚛️ Frontend Setup

Open the project directory:

cd RESUMIND

Install dependencies:

npm install

Start the development server:

npm run dev
The frontend server will start on:
http://localhost:5173

🔧 How It Works

Login — Authenticate securely using your Puter.js account
Enter Job Details — Input the company name, target role and full job description
Upload Resume — Upload your resume in PDF format
AI Analysis — RESUMIND internally converts your PDF to an image and runs AI-powered keyword analysis against the job description
Get Results — Receive your ATS compatibility score, highlighted concern points, and a detailed list of issues to fix


📝 Note

Make sure you have a valid Puter.js account to log in and use the AI analysis features
For best results, upload a clean single or multi-page PDF resume without heavy graphics or tables
The more detailed your job description input, the more accurate and relevant your ATS feedback will be


🔑 Environment Variables
To run this project locally, create a .env file in the root directory and add the following:
VITE_PUTER_APP_ID=your_puter_app_id

🤝 Contributing
Contributions, issues and feature requests are welcome!
Feel free to check the issues page or submit a pull request.

 


Built with ❤️ by Sarthak Pal
