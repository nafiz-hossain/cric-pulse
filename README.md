# 🏏 Cricket Team Management App

A comprehensive cricket team performance tracking application built with Next.js, Firebase, and Tailwind CSS.

## ✨ Features

- **📱 Mobile-First Design** - Optimized for mobile data entry
- **📊 Performance Analytics** - Team and individual player statistics
- **⚡ Live Scoring** - Ball-by-ball match recording
- **🔥 Firebase Integration** - Real-time data storage and authentication
- **📈 Interactive Charts** - Visual performance analysis
- **👥 Player Management** - Add, edit, and manage team roster

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase project
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cricket-team-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase configuration values.

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Copy your config values to `.env.local`

### Deployment to Vercel

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add environment variables**
4. **Deploy!**

## 📱 Mobile Entry Features

- **Dual Player Selection** - Select batsman and bowler simultaneously
- **Ball-by-Ball Recording** - Record each delivery with batting and bowling results
- **Touch-Optimized UI** - Large buttons perfect for mobile use
- **Real-time Aggregation** - Automatic stat calculation and storage

## 🎯 Usage

### For Team Managers
- Use **Mobile Entry** for quick practice session recording
- Access **Live Scoring** for match situations
- Manage team roster in **Player Management**
- View analytics in **Dashboard**

### For Players & Fans
- View team performance in **Dashboard**
- Track individual progress over time
- Access public statistics (when enabled)

## 🛠 Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Charts**: Recharts
- **Deployment**: Vercel

## 📊 Data Structure

The app tracks:
- **Batting Stats**: Defence, Good Hits, Miss Hits, Edge Back
- **Bowling Stats**: Legal, Wide, Short, Full Toss, No Ball
- **Session Data**: Date, players, aggregated statistics
- **Ball-by-Ball**: Individual delivery details

## 🔒 Security

- Manager-only data entry (nhremon8181@gmail.com)
- Public read access for dashboard viewing
- Firebase security rules protect data integrity

## 📈 Analytics Features

- Team performance overview
- Individual player progress tracking
- Date-based filtering
- Success rate calculations
- Visual charts and graphs

---

Built with ❤️ for the Exabyting Cricket Team# cric-pulse
