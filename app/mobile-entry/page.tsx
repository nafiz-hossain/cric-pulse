'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PlayerSession, BattingStats, BowlingStats } from '../../lib/types';
import Link from 'next/link';

interface QuickEntry {
  batsman: string;
  bowler: string;
  battingResult: keyof BattingStats;
  bowlingResult: keyof BowlingStats;
  timestamp: string;
}

export default function MobileEntry() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [entries, setEntries] = useState<QuickEntry[]>([]);
  const [selectedBatsman, setSelectedBatsman] = useState('');
  const [selectedBowler, setSelectedBowler] = useState('');
  const [selectedBattingResult, setSelectedBattingResult] = useState<keyof BattingStats | ''>('');
  const [selectedBowlingResult, setSelectedBowlingResult] = useState<keyof BowlingStats | ''>('');

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

  const resetCurrentEntry = () => {
    setSelectedBattingResult('');
    setSelectedBowlingResult('');
  };

  const addQuickEntry = () => {
    if (!selectedBatsman) {
      alert('Please select a batsman first');
      return;
    }
    if (!selectedBowler) {
      alert('Please select a bowler first');
      return;
    }
    if (!selectedBattingResult) {
      alert('Please select batting result');
      return;
    }
    if (!selectedBowlingResult) {
      alert('Please select bowling result');
      return;
    }

    const newEntry: QuickEntry = {
      batsman: selectedBatsman,
      bowler: selectedBowler,
      battingResult: selectedBattingResult,
      bowlingResult: selectedBowlingResult,
      timestamp: new Date().toISOString()
    };

    setEntries([...entries, newEntry]);
    resetCurrentEntry();
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const saveAllEntries = async () => {
    if (entries.length === 0) {
      alert('Please add at least one entry');
      return;
    }

    try {
      // Aggregate stats by player and type
      const playerStats: { [key: string]: { batting: BattingStats; bowling: BowlingStats } } = {};

      entries.forEach(entry => {
        // Initialize player stats if not exists
        if (!playerStats[entry.batsman]) {
          playerStats[entry.batsman] = {
            batting: { defence: 0, goodHit: 0, missHit: 0, edgeBack: 0 },
            bowling: { legal: 0, wide: 0, short: 0, fullToss: 0, noBall: 0 }
          };
        }
        if (!playerStats[entry.bowler]) {
          playerStats[entry.bowler] = {
            batting: { defence: 0, goodHit: 0, missHit: 0, edgeBack: 0 },
            bowling: { legal: 0, wide: 0, short: 0, fullToss: 0, noBall: 0 }
          };
        }

        // Increment batting stats for batsman
        playerStats[entry.batsman].batting[entry.battingResult]++;
        
        // Increment bowling stats for bowler
        playerStats[entry.bowler].bowling[entry.bowlingResult]++;
      });

      // Convert to PlayerSession format
      const playerSessions: PlayerSession[] = [];
      
      Object.entries(playerStats).forEach(([playerName, stats]) => {
        // Add batting session if player has batting stats
        const hasBattingStats = Object.values(stats.batting).some(val => val > 0);
        if (hasBattingStats) {
          playerSessions.push({
            playerId: playerName.toLowerCase(),
            playerName: playerName,
            type: 'batting',
            stats: stats.batting,
            date: date,
            sessionId: Date.now().toString(),
            inputBy: 'Mobile Entry',
            inputByEmail: user?.email || ''
          });
        }

        // Add bowling session if player has bowling stats
        const hasBowlingStats = Object.values(stats.bowling).some(val => val > 0);
        if (hasBowlingStats) {
          playerSessions.push({
            playerId: playerName.toLowerCase(),
            playerName: playerName,
            type: 'bowling',
            stats: stats.bowling,
            date: date,
            sessionId: Date.now().toString(),
            inputBy: 'Mobile Entry',
            inputByEmail: user?.email || ''
          });
        }
      });

      await addDoc(collection(db, 'practice-sessions'), {
        date: date,
        createdBy: 'Mobile Entry',
        createdByEmail: user?.email,
        players: playerSessions,
        createdAt: new Date().toISOString(),
        totalBalls: entries.length,
        ballByBallData: entries
      });

      alert(`✅ Session saved! ${entries.length} balls recorded for ${Object.keys(playerStats).length} players`);
      setEntries([]);
      resetCurrentEntry();
      setSelectedBatsman('');
      setSelectedBowler('');
    } catch (error: any) {
      console.error('Error saving entries:', error);
      alert(`❌ Error saving entries: ${error.message}`);
    }
  };

  if (!user || user.email !== 'nhremon8181@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Access Denied</h2>
          <p className="mb-4 text-gray-600">Only authorized managers can add practice data.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const battingOptions: { key: keyof BattingStats; name: string; emoji: string; color: string }[] = [
    { key: 'defence', name: 'Defence', emoji: '🛡️', color: 'bg-blue-100 text-blue-800' },
    { key: 'goodHit', name: 'Good Hit', emoji: '💥', color: 'bg-green-100 text-green-800' },
    { key: 'missHit', name: 'Miss Hit', emoji: '❌', color: 'bg-red-100 text-red-800' },
    { key: 'edgeBack', name: 'Edge Back', emoji: '🔙', color: 'bg-orange-100 text-orange-800' }
  ];

  const bowlingOptions: { key: keyof BowlingStats; name: string; emoji: string; color: string }[] = [
    { key: 'legal', name: 'Legal', emoji: '✅', color: 'bg-green-100 text-green-800' },
    { key: 'wide', name: 'Wide', emoji: '↔️', color: 'bg-red-100 text-red-800' },
    { key: 'short', name: 'Short', emoji: '⬇️', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'fullToss', name: 'Full Toss', emoji: '🎾', color: 'bg-purple-100 text-purple-800' },
    { key: 'noBall', name: 'No Ball', emoji: '🚫', color: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold text-gray-800">📱 Mobile Entry</h1>
            <Link href="/dashboard" className="bg-blue-600 text-white py-2 px-3 rounded-lg text-sm">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Date Selection */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <label className="block text-sm font-medium mb-2 text-gray-800">Practice Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white text-base"
          />
        </div>

        {/* Batsman Selection */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <label className="block text-sm font-medium mb-3 text-gray-800">🏏 Select Batsman</label>
          <div className="grid grid-cols-2 gap-2">
            {playerNames.map(name => (
              <button
                key={name}
                onClick={() => setSelectedBatsman(name)}
                className={`p-3 rounded-lg text-sm font-medium transition ${
                  selectedBatsman === name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Bowler Selection */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <label className="block text-sm font-medium mb-3 text-gray-800">⚾ Select Bowler</label>
          <div className="grid grid-cols-2 gap-2">
            {playerNames.filter(name => name !== selectedBatsman).map(name => (
              <button
                key={name}
                onClick={() => setSelectedBowler(name)}
                className={`p-3 rounded-lg text-sm font-medium transition ${
                  selectedBowler === name
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Ball Result Entry */}
        {selectedBatsman && selectedBowler && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-sm font-medium mb-3 text-gray-800">
              📊 {selectedBatsman} vs {selectedBowler}
            </h3>
            
            {/* Batting Result */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-2 text-gray-600">Batting Result:</label>
              <div className="grid grid-cols-2 gap-2">
                {battingOptions.map(option => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedBattingResult(option.key)}
                    className={`p-3 rounded-lg text-sm font-medium transition flex items-center justify-center space-x-2 ${
                      selectedBattingResult === option.key
                        ? option.color + ' ring-2 ring-blue-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{option.emoji}</span>
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bowling Result */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-2 text-gray-600">Bowling Result:</label>
              <div className="grid grid-cols-2 gap-2">
                {bowlingOptions.map(option => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedBowlingResult(option.key)}
                    className={`p-3 rounded-lg text-sm font-medium transition flex items-center justify-center space-x-2 ${
                      selectedBowlingResult === option.key
                        ? option.color + ' ring-2 ring-green-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{option.emoji}</span>
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={addQuickEntry}
              disabled={!selectedBattingResult || !selectedBowlingResult}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➕ Add Ball
            </button>
          </div>
        )}

        {/* Current Balls */}
        {entries.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-800">Balls Recorded ({entries.length})</h3>
              <button
                onClick={saveAllEntries}
                className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                💾 Save Session
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {entries.map((entry, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">
                      Ball {index + 1}: {entry.batsman} vs {entry.bowler}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="text-xs">
                        🏏 {battingOptions.find(opt => opt.key === entry.battingResult)?.emoji} {battingOptions.find(opt => opt.key === entry.battingResult)?.name}
                      </div>
                      <div className="text-xs">
                        ⚾ {bowlingOptions.find(opt => opt.key === entry.bowlingResult)?.emoji} {bowlingOptions.find(opt => opt.key === entry.bowlingResult)?.name}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeEntry(index)}
                    className="ml-2 bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg text-xs transition"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Link href="/live-scoring" className="bg-orange-600 text-white p-4 rounded-lg text-center font-medium hover:bg-orange-700 transition">
            ⚡ Live Scoring
          </Link>
          <Link href="/bulk-entry" className="bg-purple-600 text-white p-4 rounded-lg text-center font-medium hover:bg-purple-700 transition">
            📊 Bulk Entry
          </Link>
        </div>
      </div>
    </div>
  );
}