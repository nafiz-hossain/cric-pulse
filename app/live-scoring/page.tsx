'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';

interface Ball {
  id: string;
  bowler: string;
  batsman: string;
  result: 'legal' | 'wide' | 'noBall' | 'short' | 'fullToss';
  battingResult: 'defence' | 'missHit' | 'goodHit' | 'edgeBack' | 'none';
  runs: number;
  timestamp: string;
}

interface Over {
  overNumber: number;
  balls: Ball[];
  bowler: string;
}

export default function LiveScoring() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<string[]>([]);
  const [currentBatsman, setCurrentBatsman] = useState('');
  const [currentBowler, setCurrentBowler] = useState('');
  const [currentOver, setCurrentOver] = useState<Over>({ overNumber: 1, balls: [], bowler: '' });
  const [allOvers, setAllOvers] = useState<Over[]>([]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);

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
      setPlayers(activePlayerNames);
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayers(['Sumon', 'Afridi', 'Maruf', 'Robi', 'Piash', 'Ahsan']);
    }
  };

  const addBall = (bowlingResult: Ball['result'], battingResult: Ball['battingResult'], runs: number = 0) => {
    if (!currentBatsman || !currentBowler) {
      alert('Please select both batsman and bowler');
      return;
    }

    const newBall: Ball = {
      id: Date.now().toString(),
      bowler: currentBowler,
      batsman: currentBatsman,
      result: bowlingResult,
      battingResult: battingResult,
      runs: runs,
      timestamp: new Date().toISOString()
    };

    const updatedOver = {
      ...currentOver,
      bowler: currentBowler,
      balls: [...currentOver.balls, newBall]
    };

    setCurrentOver(updatedOver);

    // Complete over after 6 legal balls
    const legalBalls = updatedOver.balls.filter(ball => 
      ball.result === 'legal' || ball.result === 'short' || ball.result === 'fullToss'
    );

    if (legalBalls.length >= 6) {
      setAllOvers([...allOvers, updatedOver]);
      setCurrentOver({ 
        overNumber: currentOver.overNumber + 1, 
        balls: [], 
        bowler: '' 
      });
      setCurrentBowler('');
    }
  };

  const saveSession = async () => {
    if (allOvers.length === 0 && currentOver.balls.length === 0) {
      alert('No balls recorded yet');
      return;
    }

    try {
      // Combine all overs including current incomplete over
      const allBalls = [...allOvers, currentOver].flatMap(over => over.balls);
      
      // Group by player and type
      const playerStats: any = {};
      
      allBalls.forEach(ball => {
        // Batting stats
        if (!playerStats[ball.batsman]) {
          playerStats[ball.batsman] = { batting: { defence: 0, missHit: 0, goodHit: 0, edgeBack: 0 } };
        }
        if (ball.battingResult !== 'none') {
          playerStats[ball.batsman].batting[ball.battingResult]++;
        }

        // Bowling stats
        if (!playerStats[ball.bowler]) {
          playerStats[ball.bowler] = { bowling: { legal: 0, wide: 0, noBall: 0, short: 0, fullToss: 0 } };
        }
        if (!playerStats[ball.bowler].bowling) {
          playerStats[ball.bowler].bowling = { legal: 0, wide: 0, noBall: 0, short: 0, fullToss: 0 };
        }
        playerStats[ball.bowler].bowling[ball.result]++;
      });

      // Convert to practice session format
      const players: any[] = [];
      Object.entries(playerStats).forEach(([playerName, stats]: [string, any]) => {
        if (stats.batting) {
          players.push({
            playerId: playerName.toLowerCase(),
            playerName: playerName,
            type: 'batting',
            stats: stats.batting,
            date: sessionDate,
            sessionId: Date.now().toString(),
            inputBy: 'Live Scoring',
            inputByEmail: user?.email || ''
          });
        }
        if (stats.bowling) {
          players.push({
            playerId: playerName.toLowerCase(),
            playerName: playerName,
            type: 'bowling',
            stats: stats.bowling,
            date: sessionDate,
            sessionId: Date.now().toString(),
            inputBy: 'Live Scoring',
            inputByEmail: user?.email || ''
          });
        }
      });

      await addDoc(collection(db, 'practice-sessions'), {
        date: sessionDate,
        createdBy: 'Live Scoring',
        createdByEmail: user?.email,
        players: players,
        createdAt: new Date().toISOString(),
        liveScoring: true,
        totalBalls: allBalls.length,
        totalOvers: allOvers.length + (currentOver.balls.length > 0 ? 1 : 0)
      });

      alert('✅ Live session saved successfully!');
      
      // Reset session
      setAllOvers([]);
      setCurrentOver({ overNumber: 1, balls: [], bowler: '' });
      setCurrentBatsman('');
      setCurrentBowler('');
    } catch (error: any) {
      console.error('Error saving session:', error);
      alert(`❌ Error saving session: ${error.message}`);
    }
  };

  if (!user || user.email !== 'nhremon8181@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Only authorized managers can use live scoring.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalBalls = [...allOvers, currentOver].flatMap(over => over.balls).length;
  const legalBalls = [...allOvers, currentOver].flatMap(over => over.balls).filter(ball => 
    ball.result === 'legal' || ball.result === 'short' || ball.result === 'fullToss'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Live Cricket Scoring</h1>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm">
                Dashboard
              </Link>
              <button
                onClick={saveSession}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
              >
                Save Session
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Session Info */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Date</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm"
              />
            </div>
            <div className="text-center bg-blue-50 p-3 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">Over {currentOver.overNumber}</div>
              <div className="text-sm text-gray-600">{currentOver.balls.length}/6 balls</div>
            </div>
            <div className="text-center bg-green-50 p-3 rounded-lg">
              <div className="text-base sm:text-lg font-semibold">Total: {totalBalls} balls</div>
              <div className="text-sm text-gray-600">{legalBalls} legal deliveries</div>
            </div>
          </div>
        </div>

        {/* Player Selection */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-blue-600">🏏 Current Batsman</h3>
            <select
              value={currentBatsman}
              onChange={(e) => setCurrentBatsman(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm"
            >
              <option value="">Select Batsman</option>
              {players.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-green-600">⚾ Current Bowler</h3>
            <select
              value={currentBowler}
              onChange={(e) => setCurrentBowler(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm"
            >
              <option value="">Select Bowler</option>
              {players.filter(p => p !== currentBatsman).map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ball Entry Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Record Ball</h3>
          
          {/* Bowling Result */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-green-600 text-sm sm:text-base">Bowling Result:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <button
                onClick={() => addBall('legal', 'none')}
                className="bg-green-100 text-green-800 py-3 px-2 rounded-lg hover:bg-green-200 text-xs sm:text-sm font-medium"
              >
                ✅ Legal
              </button>
              <button
                onClick={() => addBall('wide', 'none')}
                className="bg-red-100 text-red-800 py-3 px-2 rounded-lg hover:bg-red-200 text-xs sm:text-sm font-medium"
              >
                ↔️ Wide
              </button>
              <button
                onClick={() => addBall('noBall', 'none')}
                className="bg-red-100 text-red-800 py-3 px-2 rounded-lg hover:bg-red-200 text-xs sm:text-sm font-medium"
              >
                🚫 No Ball
              </button>
              <button
                onClick={() => addBall('short', 'none')}
                className="bg-yellow-100 text-yellow-800 py-3 px-2 rounded-lg hover:bg-yellow-200 text-xs sm:text-sm font-medium"
              >
                ⬇️ Short
              </button>
              <button
                onClick={() => addBall('fullToss', 'none')}
                className="bg-purple-100 text-purple-800 py-3 px-2 rounded-lg hover:bg-purple-200 text-xs sm:text-sm font-medium"
              >
                🎾 Full Toss
              </button>
            </div>
          </div>

          {/* Batting Result */}
          <div>
            <h4 className="font-medium mb-3 text-blue-600 text-sm sm:text-base">Batting Result:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => addBall('legal', 'defence')}
                className="bg-blue-100 text-blue-800 py-3 px-2 rounded-lg hover:bg-blue-200 text-xs sm:text-sm font-medium"
              >
                🛡️ Defence
              </button>
              <button
                onClick={() => addBall('legal', 'goodHit')}
                className="bg-green-100 text-green-800 py-3 px-2 rounded-lg hover:bg-green-200 text-xs sm:text-sm font-medium"
              >
                💥 Good Hit
              </button>
              <button
                onClick={() => addBall('legal', 'missHit')}
                className="bg-red-100 text-red-800 py-3 px-2 rounded-lg hover:bg-red-200 text-xs sm:text-sm font-medium"
              >
                ❌ Miss Hit
              </button>
              <button
                onClick={() => addBall('legal', 'edgeBack')}
                className="bg-orange-100 text-orange-800 py-3 px-2 rounded-lg hover:bg-orange-200 text-xs sm:text-sm font-medium"
              >
                🔙 Edge Back
              </button>
            </div>
          </div>
        </div>

        {/* Current Over Display */}
        {currentOver.balls.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Current Over</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {currentOver.balls.map((ball, index) => (
                <div
                  key={ball.id}
                  className={`p-3 rounded-lg text-xs sm:text-sm font-medium ${
                    ball.result === 'legal' ? 'bg-green-100 text-green-800' :
                    ball.result === 'wide' ? 'bg-red-100 text-red-800' :
                    ball.result === 'noBall' ? 'bg-red-100 text-red-800' :
                    ball.result === 'short' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}
                >
                  <div className="font-semibold">Ball {index + 1}</div>
                  <div>{ball.result}</div>
                  {ball.battingResult !== 'none' && <div className="text-xs">({ball.battingResult})</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Overs */}
        {allOvers.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Completed Overs ({allOvers.length})</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {allOvers.map((over, overIndex) => (
                <div key={overIndex} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r">
                  <div className="font-medium text-sm sm:text-base">Over {over.overNumber} - {over.bowler}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    {over.balls.length} balls: {over.balls.map(ball => ball.result).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}