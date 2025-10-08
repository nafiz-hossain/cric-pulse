'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PlayerSession, BattingStats, BowlingStats } from '../../lib/types';
import Link from 'next/link';

interface BulkSession {
  batsman: string;
  bowlers: Array<{
    name: string;
    stats: BowlingStats;
  }>;
  battingStats: BattingStats;
}

export default function BulkEntry() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [sessions, setSessions] = useState<BulkSession[]>([]);
  const [currentSession, setCurrentSession] = useState<BulkSession>({
    batsman: '',
    bowlers: [],
    battingStats: { defence: 0, missHit: 0, goodHit: 0, edgeBack: 0 }
  });
  const [currentBowler, setCurrentBowler] = useState({
    name: '',
    stats: { legal: 0, fullToss: 0, wide: 0, short: 0, noBall: 0 }
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'players'));
      const playersData = querySnapshot.docs.map(doc => doc.data());
      const activePlayerNames = playersData
        .filter(player => player.isActive !== false)
        .map(player => player.name)
        .sort();
      setPlayerNames(activePlayerNames);
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayerNames(['Sumon', 'Afridi', 'Maruf', 'Robi', 'Piash', 'Ahsan']);
    }
  };

  const addBowlerToSession = () => {
    if (!currentBowler.name) return;

    setCurrentSession({
      ...currentSession,
      bowlers: [...currentSession.bowlers, { ...currentBowler }]
    });

    setCurrentBowler({
      name: '',
      stats: { legal: 0, fullToss: 0, wide: 0, short: 0, noBall: 0 }
    });
  };

  const removeBowlerFromSession = (index: number) => {
    setCurrentSession({
      ...currentSession,
      bowlers: currentSession.bowlers.filter((_, i) => i !== index)
    });
  };

  const addSessionToList = () => {
    if (!currentSession.batsman || currentSession.bowlers.length === 0) {
      alert('Please select a batsman and add at least one bowler');
      return;
    }

    setSessions([...sessions, { ...currentSession }]);
    setCurrentSession({
      batsman: '',
      bowlers: [],
      battingStats: { defence: 0, missHit: 0, goodHit: 0, edgeBack: 0 }
    });
  };

  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const saveAllSessions = async () => {
    if (sessions.length === 0) {
      alert('Please add at least one batting session');
      return;
    }

    try {
      const allPlayerSessions: PlayerSession[] = [];

      sessions.forEach(session => {
        // Add batting session
        allPlayerSessions.push({
          playerId: session.batsman.toLowerCase(),
          playerName: session.batsman,
          type: 'batting',
          stats: session.battingStats,
          date: date,
          sessionId: Date.now().toString(),
          inputBy: 'Team Manager',
          inputByEmail: user?.email || ''
        });

        // Add bowling sessions
        session.bowlers.forEach(bowler => {
          allPlayerSessions.push({
            playerId: bowler.name.toLowerCase(),
            playerName: bowler.name,
            type: 'bowling',
            stats: bowler.stats,
            date: date,
            sessionId: Date.now().toString(),
            inputBy: 'Team Manager',
            inputByEmail: user?.email || ''
          });
        });
      });

      await addDoc(collection(db, 'practice-sessions'), {
        date: date,
        createdBy: 'Team Manager',
        createdByEmail: user?.email,
        players: allPlayerSessions,
        createdAt: new Date().toISOString()
      });

      alert('✅ All practice sessions saved successfully!');
      setSessions([]);
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error: any) {
      console.error('Error saving sessions:', error);
      alert(`❌ Error saving sessions: ${error.message}`);
    }
  };

  if (!user || user.email !== 'nhremon8181@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Only authorized managers can add practice data.</p>
          <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Bulk Practice Entry</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Link href="/add-session" className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-center text-sm sm:text-base">
              Single Entry
            </Link>
            <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-center text-sm sm:text-base">
              Back to Home
            </Link>
          </div>
        </div>

        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Date */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <label className="block text-sm font-medium mb-2 text-gray-800">Practice Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Current Session */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Current Batting Session</h3>
              
              {/* Batsman Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-800">Batsman</label>
                <select
                  value={currentSession.batsman}
                  onChange={(e) => setCurrentSession({...currentSession, batsman: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select Batsman</option>
                  {playerNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Batting Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-800">Defence</label>
                  <input
                    type="number"
                    min="0"
                    value={currentSession.battingStats.defence}
                    onChange={(e) => setCurrentSession({
                      ...currentSession,
                      battingStats: {...currentSession.battingStats, defence: parseInt(e.target.value) || 0}
                    })}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-800">Miss Hit</label>
                  <input
                    type="number"
                    min="0"
                    value={currentSession.battingStats.missHit}
                    onChange={(e) => setCurrentSession({
                      ...currentSession,
                      battingStats: {...currentSession.battingStats, missHit: parseInt(e.target.value) || 0}
                    })}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-800">Good Hit</label>
                  <input
                    type="number"
                    min="0"
                    value={currentSession.battingStats.goodHit}
                    onChange={(e) => setCurrentSession({
                      ...currentSession,
                      battingStats: {...currentSession.battingStats, goodHit: parseInt(e.target.value) || 0}
                    })}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-800">Edge Back</label>
                  <input
                    type="number"
                    min="0"
                    value={currentSession.battingStats.edgeBack}
                    onChange={(e) => setCurrentSession({
                      ...currentSession,
                      battingStats: {...currentSession.battingStats, edgeBack: parseInt(e.target.value) || 0}
                    })}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Current Bowlers */}
              {currentSession.bowlers.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-gray-800 text-sm sm:text-base">Bowlers in this session:</h4>
                  <div className="space-y-2">
                    {currentSession.bowlers.map((bowler, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-100 rounded space-y-2 sm:space-y-0">
                        <span className="font-medium text-sm sm:text-base">{bowler.name}</span>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <span className="text-xs sm:text-sm text-gray-600">
                            Legal: {bowler.stats.legal}, Wide: {bowler.stats.wide}, Short: {bowler.stats.short}
                          </span>
                          <button
                            onClick={() => removeBowlerFromSession(index)}
                            className="text-red-600 hover:text-red-800 text-xs sm:text-sm bg-red-100 px-2 py-1 rounded w-fit"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={addSessionToList}
                disabled={!currentSession.batsman || currentSession.bowlers.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Add Batting Session
              </button>
            </div>

            {/* Add Bowler */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Add Bowler to Current Session</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-800">Bowler</label>
                <select
                  value={currentBowler.name}
                  onChange={(e) => setCurrentBowler({...currentBowler, name: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select Bowler</option>
                  {playerNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-800">Legal</label>
                  <input
                    type="number"
                    min="0"
                    value={currentBowler.stats.legal}
                    onChange={(e) => setCurrentBowler({
                      ...currentBowler,
                      stats: {...currentBowler.stats, legal: parseInt(e.target.value) || 0}
                    })}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-800">Full Toss</label>
                  <input
                    type="number"
                    min="0"
                    value={currentBowler.stats.fullToss}
                    onChange={(e) => setCurrentBowler({
                      ...currentBowler,
                      stats: {...currentBowler.stats, fullToss: parseInt(e.target.value) || 0}
                    })}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-800">Wide</label>
                  <input
                    type="number"
                    min="0"
                    value={currentBowler.stats.wide}
                    onChange={(e) => setCurrentBowler({
                      ...currentBowler,
                      stats: {...currentBowler.stats, wide: parseInt(e.target.value) || 0}
                    })}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-800">Short</label>
                  <input
                    type="number"
                    min="0"
                    value={currentBowler.stats.short}
                    onChange={(e) => setCurrentBowler({
                      ...currentBowler,
                      stats: {...currentBowler.stats, short: parseInt(e.target.value) || 0}
                    })}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-800">No Ball</label>
                  <input
                    type="number"
                    min="0"
                    value={currentBowler.stats.noBall}
                    onChange={(e) => setCurrentBowler({
                      ...currentBowler,
                      stats: {...currentBowler.stats, noBall: parseInt(e.target.value) || 0}
                    })}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              <button
                onClick={addBowlerToSession}
                disabled={!currentBowler.name}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Add Bowler to Session
              </button>
            </div>
          </div>

          {/* Sessions Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Practice Sessions Summary</h3>
              
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No sessions added yet</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {sessions.map((session, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                        <h4 className="font-semibold text-base sm:text-lg text-gray-800">{session.batsman} Batting</h4>
                        <button
                          onClick={() => removeSession(index)}
                          className="text-red-600 hover:text-red-800 text-xs sm:text-sm bg-red-100 px-2 py-1 rounded w-fit"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs sm:text-sm">
                        <div className="bg-blue-50 p-2 rounded">Defence: {session.battingStats.defence}</div>
                        <div className="bg-red-50 p-2 rounded">Miss Hit: {session.battingStats.missHit}</div>
                        <div className="bg-green-50 p-2 rounded">Good Hit: {session.battingStats.goodHit}</div>
                        <div className="bg-yellow-50 p-2 rounded">Edge Back: {session.battingStats.edgeBack}</div>
                      </div>
                      
                      <div className="text-xs sm:text-sm text-gray-600">
                        <strong>Bowlers ({session.bowlers.length}):</strong>
                        {session.bowlers.map((bowler, bIndex) => (
                          <div key={bIndex} className="ml-2 sm:ml-4 mt-1">
                            • {bowler.name}: Legal {bowler.stats.legal}, Wide {bowler.stats.wide}, Short {bowler.stats.short}
                            {(bowler.stats.fullToss || 0) > 0 && `, Full Toss ${bowler.stats.fullToss}`}
                            {(bowler.stats.noBall || 0) > 0 && `, No Ball ${bowler.stats.noBall}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sessions.length > 0 && (
                <button
                  onClick={saveAllSessions}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold text-sm sm:text-base"
                >
                  💾 Save All Practice Sessions ({sessions.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}