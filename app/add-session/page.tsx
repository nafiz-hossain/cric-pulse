'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PlayerSession, BattingStats, BowlingStats } from '../../lib/types';
import Link from 'next/link';

export default function AddSession() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [players, setPlayers] = useState<PlayerSession[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState({
    name: '',
    type: 'batting' as 'batting' | 'bowling',
    stats: {} as BattingStats | BowlingStats
  });

  const [playerNames, setPlayerNames] = useState<string[]>([]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'players'));
      const playersData = querySnapshot.docs.map(doc => doc.data());
      const activePlayerNames = playersData
        .filter(player => player.isActive !== false) // Include players without isActive field (backward compatibility)
        .map(player => player.name)
        .sort();
      setPlayerNames(activePlayerNames);
    } catch (error) {
      console.error('Error fetching players:', error);
      // Fallback to hardcoded names if database fetch fails
      setPlayerNames(['Sumon', 'Afridi', 'Maruf', 'Robi', 'Piash', 'Ahsan']);
    }
  };

  const addPlayerSession = () => {
    if (!currentPlayer.name) return;

    const newSession: PlayerSession = {
      playerId: currentPlayer.name.toLowerCase(),
      playerName: currentPlayer.name,
      type: currentPlayer.type,
      stats: currentPlayer.stats,
      date: date,
      sessionId: Date.now().toString(),
      inputBy: 'Team Manager',
      inputByEmail: user?.email || ''
    };

    setPlayers([...players, newSession]);
    setCurrentPlayer({
      name: '',
      type: 'batting',
      stats: {}
    });
  };

  const saveSession = async () => {
    if (players.length === 0) {
      alert('Please add at least one player session before saving.');
      return;
    }

    try {
      console.log('Attempting to save session...', { date, players });
      
      const docRef = await addDoc(collection(db, 'practice-sessions'), {
        date: date,
        createdBy: 'Team Manager',
        createdByEmail: user?.email,
        players: players,
        createdAt: new Date().toISOString()
      });

      console.log('Session saved successfully with ID:', docRef.id);
      alert('✅ Practice session saved successfully!');
      setPlayers([]);
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error: any) {
      console.error('Error saving session:', error);
      alert(`❌ Error saving session: ${error.message}\n\nCheck console for details.`);
    }
  };

  if (!user || user.email !== 'nhremon8181@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Only authorized managers can add practice data.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Add Practice Session</h1>
          <Link href="/" className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-sm sm:text-base w-full sm:w-auto text-center">
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-800">Practice Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">Player Name</label>
              <select
                value={currentPlayer.name}
                onChange={(e) => setCurrentPlayer({...currentPlayer, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
              >
                <option value="">Select Player</option>
                {playerNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">Activity Type</label>
              <select
                value={currentPlayer.type}
                onChange={(e) => setCurrentPlayer({...currentPlayer, type: e.target.value as 'batting' | 'bowling'})}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
              >
                <option value="batting">Batting</option>
                <option value="bowling">Bowling</option>
              </select>
            </div>
          </div>

          {currentPlayer.type === 'batting' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Defence</label>
                <input
                  type="number"
                  min="0"
                  value={(currentPlayer.stats as BattingStats).defence || ''}
                  onChange={(e) => setCurrentPlayer({
                    ...currentPlayer,
                    stats: {...currentPlayer.stats, defence: parseInt(e.target.value) || 0}
                  })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Miss Hit</label>
                <input
                  type="number"
                  min="0"
                  value={(currentPlayer.stats as BattingStats).missHit || ''}
                  onChange={(e) => setCurrentPlayer({
                    ...currentPlayer,
                    stats: {...currentPlayer.stats, missHit: parseInt(e.target.value) || 0}
                  })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Good Hit</label>
                <input
                  type="number"
                  min="0"
                  value={(currentPlayer.stats as BattingStats).goodHit || ''}
                  onChange={(e) => setCurrentPlayer({
                    ...currentPlayer,
                    stats: {...currentPlayer.stats, goodHit: parseInt(e.target.value) || 0}
                  })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Edge Back</label>
                <input
                  type="number"
                  min="0"
                  value={(currentPlayer.stats as BattingStats).edgeBack || ''}
                  onChange={(e) => setCurrentPlayer({
                    ...currentPlayer,
                    stats: {...currentPlayer.stats, edgeBack: parseInt(e.target.value) || 0}
                  })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Legal</label>
                <input
                  type="number"
                  min="0"
                  value={(currentPlayer.stats as BowlingStats).legal || ''}
                  onChange={(e) => setCurrentPlayer({
                    ...currentPlayer,
                    stats: {...currentPlayer.stats, legal: parseInt(e.target.value) || 0}
                  })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Full Toss</label>
                <input
                  type="number"
                  min="0"
                  value={(currentPlayer.stats as BowlingStats).fullToss || ''}
                  onChange={(e) => setCurrentPlayer({
                    ...currentPlayer,
                    stats: {...currentPlayer.stats, fullToss: parseInt(e.target.value) || 0}
                  })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Wide</label>
                <input
                  type="number"
                  min="0"
                  value={(currentPlayer.stats as BowlingStats).wide || ''}
                  onChange={(e) => setCurrentPlayer({
                    ...currentPlayer,
                    stats: {...currentPlayer.stats, wide: parseInt(e.target.value) || 0}
                  })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Short</label>
                <input
                  type="number"
                  min="0"
                  value={(currentPlayer.stats as BowlingStats).short || ''}
                  onChange={(e) => setCurrentPlayer({
                    ...currentPlayer,
                    stats: {...currentPlayer.stats, short: parseInt(e.target.value) || 0}
                  })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-800">No Ball</label>
                <input
                  type="number"
                  min="0"
                  value={(currentPlayer.stats as BowlingStats).noBall || ''}
                  onChange={(e) => setCurrentPlayer({
                    ...currentPlayer,
                    stats: {...currentPlayer.stats, noBall: parseInt(e.target.value) || 0}
                  })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm sm:text-base"
                />
              </div>
            </div>
          )}

          <button
            onClick={addPlayerSession}
            className="mt-6 w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            Add Player Data
          </button>
        </div>

        {players.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Session Summary</h3>
            <div className="space-y-3 mb-6">
              {players.map((player, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-lg text-gray-800">{player.playerName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          player.type === 'batting' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {player.type === 'batting' ? '🏏 Batting' : '⚾ Bowling'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {Object.entries(player.stats).map(([key, value]) => (
                          <div key={key} className="bg-white px-2 py-1 rounded border">
                            <span className="font-medium text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="ml-1 font-semibold text-gray-800">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        const updatedPlayers = players.filter((_, i) => i !== index);
                        setPlayers(updatedPlayers);
                      }}
                      className="ml-4 bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition duration-200"
                      title="Remove this entry"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={saveSession}
              className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700"
            >
              Save Practice Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}