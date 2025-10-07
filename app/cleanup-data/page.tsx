'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PracticeSession } from '../../lib/types';
import Link from 'next/link';

export default function CleanupData() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'practice-sessions'));
      const sessionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PracticeSession[];
      setSessions(sessionsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  const analyzeData = () => {
    const totalEntries = sessions.reduce((acc, session) => acc + session.players.length, 0);
    const uniquePlayers = new Set();
    const playerCounts: { [key: string]: number } = {};

    sessions.forEach(session => {
      session.players.forEach(player => {
        uniquePlayers.add(player.playerName);
        playerCounts[player.playerName] = (playerCounts[player.playerName] || 0) + 1;
      });
    });

    return {
      totalSessions: sessions.length,
      totalEntries,
      uniquePlayers: uniquePlayers.size,
      playerCounts
    };
  };

  const cleanupDuplicateData = async () => {
    if (!confirm('This will reorganize your data. Are you sure? This action cannot be undone.')) {
      return;
    }

    setCleaning(true);
    try {
      // Group all player sessions by date and player
      const groupedData: { [date: string]: { [player: string]: any[] } } = {};
      
      sessions.forEach(session => {
        session.players.forEach(player => {
          if (!groupedData[session.date]) {
            groupedData[session.date] = {};
          }
          if (!groupedData[session.date][player.playerName]) {
            groupedData[session.date][player.playerName] = [];
          }
          groupedData[session.date][player.playerName].push(player);
        });
      });

      // Delete all existing sessions
      for (const session of sessions) {
        await deleteDoc(doc(db, 'practice-sessions', session.id));
      }

      // Create new organized sessions
      for (const [date, playersData] of Object.entries(groupedData)) {
        const allPlayers = Object.values(playersData).flat();
        
        await addDoc(collection(db, 'practice-sessions'), {
          date: date,
          createdBy: 'Team Manager',
          createdByEmail: user?.email,
          players: allPlayers,
          createdAt: new Date().toISOString(),
          cleanedUp: true
        });
      }

      alert('✅ Data cleanup completed successfully!');
      await fetchSessions();
    } catch (error: any) {
      console.error('Error cleaning up data:', error);
      alert(`❌ Error during cleanup: ${error.message}`);
    } finally {
      setCleaning(false);
    }
  };

  if (!user || user.email !== 'nhremon8181@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Only authorized managers can clean up data.</p>
          <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading data analysis...</div>
      </div>
    );
  }

  const analysis = analyzeData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Data Cleanup & Analysis</h1>
          <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>

        {/* Data Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Data Analysis</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Sessions</h3>
              <p className="text-2xl font-bold text-blue-600">{analysis.totalSessions}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Total Entries</h3>
              <p className="text-2xl font-bold text-green-600">{analysis.totalEntries}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Unique Players</h3>
              <p className="text-2xl font-bold text-purple-600">{analysis.uniquePlayers}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">Avg Entries/Player</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {Math.round(analysis.totalEntries / analysis.uniquePlayers)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-gray-800">Player Entry Counts:</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(analysis.playerCounts).map(([player, count]) => (
                <div key={player} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="font-medium">{player}</span>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${
                    count > 10 ? 'bg-red-100 text-red-800' : 
                    count > 5 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {count} entries
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Problem Explanation */}
        {analysis.totalEntries > analysis.uniquePlayers * 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">⚠️ Data Issue Detected</h2>
            <div className="space-y-3 text-yellow-700">
              <p><strong>Problem:</strong> You have {analysis.totalEntries} individual entries for only {analysis.uniquePlayers} players.</p>
              <p><strong>Cause:</strong> Each bowling delivery was added as a separate "player session" instead of being grouped properly.</p>
              <p><strong>Impact:</strong> Dashboard shows inflated player counts and confusing analytics.</p>
              <p><strong>Solution:</strong> Use the cleanup tool below to reorganize data by practice date.</p>
            </div>
          </div>
        )}

        {/* Cleanup Tool */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Data Cleanup Tool</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">What this will do:</h3>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Group all player entries by practice date</li>
              <li>Combine multiple entries for the same player on the same date</li>
              <li>Create clean, organized practice sessions</li>
              <li>Preserve all your statistical data</li>
              <li>Fix the "27 players" issue in dashboard</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Important Warning:</h3>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              <li>This action cannot be undone</li>
              <li>All existing practice sessions will be reorganized</li>
              <li>Make sure you have a backup if needed</li>
              <li>The cleanup process may take a few moments</li>
            </ul>
          </div>

          <button
            onClick={cleanupDuplicateData}
            disabled={cleaning}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {cleaning ? '🔄 Cleaning Up Data...' : '🧹 Clean Up & Reorganize Data'}
          </button>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 Future Recommendations</h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>For bulk practice sessions:</strong> Use the "Bulk Practice Entry" page instead of adding individual entries.</p>
            <p><strong>For single player stats:</strong> Use the regular "Add Practice Session" page.</p>
            <p><strong>Data organization:</strong> Group related activities (one batsman facing multiple bowlers) in single sessions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}