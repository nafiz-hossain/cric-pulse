'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PracticeSession, PlayerSession, BattingStats, BowlingStats } from '../../lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

// Sign In Modal Component
function SignInModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setError('');

    try {
      const { signInWithEmail } = await import('../../lib/auth');
      await signInWithEmail(email, password);
      setIsOpen(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
      >
        Sign In
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Sign In</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="nhremon8181@gmail.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                {isSigningIn ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-4 text-center">
              Only authorized team managers can add data
            </p>
          </div>
        </div>
      )}
    </>
  );
}

const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [viewMode, setViewMode] = useState<'team' | 'individual'>('team');
  const [filterMode, setFilterMode] = useState<'overall' | 'date'>('overall');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [modalPlayerName, setModalPlayerName] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const q = query(collection(db, 'practice-sessions'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
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

  const deleteSession = async (sessionId: string, sessionDate: string) => {
    if (!user || user.email !== 'nhremon8181@gmail.com') {
      alert('Only authorized managers can delete sessions');
      return;
    }

    if (!confirm(`Are you sure you want to delete the practice session from ${sessionDate}? This will remove all player entries from this session and cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'practice-sessions', sessionId));
      await fetchSessions(); // Refresh the list
      alert('✅ Practice session deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting session:', error);
      alert(`❌ Error deleting session: ${error.message}`);
    }
  };

  const getAvailableDates = () => {
    const dates = new Set<string>();
    sessions.forEach(session => {
      dates.add(session.date);
    });
    return Array.from(dates).sort().reverse();
  };

  const getFilteredSessions = () => {
    if (filterMode === 'date' && selectedDate) {
      return sessions.filter(session => session.date === selectedDate);
    }
    return sessions; // Overall - all sessions
  };

  const getAllPlayers = () => {
    const filteredSessions = getFilteredSessions();
    const players = new Set<string>();
    filteredSessions.forEach(session => {
      session.players.forEach(player => {
        players.add(player.playerName);
      });
    });
    return Array.from(players).sort();
  };

  const getPlayerStats = (playerName: string) => {
    const filteredSessions = getFilteredSessions();
    const playerSessions = filteredSessions.flatMap(session => 
      session.players.filter(p => p.playerName === playerName)
    );

    // Aggregate batting stats
    const battingStats = playerSessions
      .filter(p => p.type === 'batting')
      .reduce((acc, p) => {
        const stats = p.stats as BattingStats;
        return {
          defence: acc.defence + (stats.defence || 0),
          missHit: acc.missHit + (stats.missHit || 0),
          goodHit: acc.goodHit + (stats.goodHit || 0),
          edgeBack: acc.edgeBack + (stats.edgeBack || 0),
        };
      }, { defence: 0, missHit: 0, goodHit: 0, edgeBack: 0 });

    // Aggregate bowling stats
    const bowlingStats = playerSessions
      .filter(p => p.type === 'bowling')
      .reduce((acc, p) => {
        const stats = p.stats as BowlingStats;
        return {
          legal: acc.legal + (stats.legal || 0),
          fullToss: acc.fullToss + (stats.fullToss || 0),
          wide: acc.wide + (stats.wide || 0),
          short: acc.short + (stats.short || 0),
          noBall: acc.noBall + (stats.noBall || 0),
        };
      }, { legal: 0, fullToss: 0, wide: 0, short: 0, noBall: 0 });

    return { battingStats, bowlingStats };
  };

  const getTeamOverview = () => {
    const players = getAllPlayers();
    return players.map(playerName => {
      const { battingStats, bowlingStats } = getPlayerStats(playerName);
      
      // Batting Success: (Good Hit + Defence) / (Good Hit + Defence + Miss Hit + Edge Back)
      const totalBalls = battingStats.defence + battingStats.missHit + battingStats.goodHit + battingStats.edgeBack;
      const successRate = totalBalls > 0 ? Math.round(((battingStats.goodHit + battingStats.defence) / totalBalls) * 100) : 0;
      
      // Bowling Success: (Legal + Short + Full Toss) / (Legal + Short + Full Toss + No Ball + Wide)
      const totalBowls = bowlingStats.legal + bowlingStats.fullToss + bowlingStats.wide + bowlingStats.short + bowlingStats.noBall;
      const successfulBowls = bowlingStats.legal + bowlingStats.short + bowlingStats.fullToss;
      const bowlingAccuracy = totalBowls > 0 ? Math.round((successfulBowls / totalBowls) * 100) : 0;

      return {
        name: playerName,
        ...battingStats,
        ...bowlingStats,
        successRate,
        bowlingAccuracy,
        totalBalls,
        totalBowls
      };
    });
  };

  const getPlayerProgress = (playerName: string) => {
    const playerSessions = sessions.flatMap(session => 
      session.players.filter(p => p.playerName === playerName)
    );

    // Group by date
    const sessionsByDate = playerSessions.reduce((acc, session) => {
      if (!acc[session.date]) {
        acc[session.date] = { batting: [], bowling: [] };
      }
      if (session.type === 'batting') {
        acc[session.date].batting.push(session.stats as BattingStats);
      } else {
        acc[session.date].bowling.push(session.stats as BowlingStats);
      }
      return acc;
    }, {} as any);

    // Calculate progress over time
    return Object.entries(sessionsByDate).map(([date, data]: [string, any]) => {
      const battingTotal = data.batting.reduce((acc: any, stats: BattingStats) => ({
        defence: acc.defence + (stats.defence || 0),
        missHit: acc.missHit + (stats.missHit || 0),
        goodHit: acc.goodHit + (stats.goodHit || 0),
        edgeBack: acc.edgeBack + (stats.edgeBack || 0),
      }), { defence: 0, missHit: 0, goodHit: 0, edgeBack: 0 });

      const bowlingTotal = data.bowling.reduce((acc: any, stats: BowlingStats) => ({
        legal: acc.legal + (stats.legal || 0),
        fullToss: acc.fullToss + (stats.fullToss || 0),
        wide: acc.wide + (stats.wide || 0),
        short: acc.short + (stats.short || 0),
        noBall: acc.noBall + (stats.noBall || 0),
      }), { legal: 0, fullToss: 0, wide: 0, short: 0, noBall: 0 });

      // Batting Success: (Good Hit + Defence) / (Good Hit + Defence + Miss Hit + Edge Back)
      const totalBalls = battingTotal.defence + battingTotal.missHit + battingTotal.goodHit + battingTotal.edgeBack;
      const battingSuccess = totalBalls > 0 ? Math.round(((battingTotal.goodHit + battingTotal.defence) / totalBalls) * 100) : 0;

      // Bowling Success: (Legal + Short + Full Toss) / (Legal + Short + Full Toss + No Ball + Wide)
      const totalBowls = bowlingTotal.legal + bowlingTotal.fullToss + bowlingTotal.wide + bowlingTotal.short + bowlingTotal.noBall;
      const successfulBowls = bowlingTotal.legal + bowlingTotal.short + bowlingTotal.fullToss;
      const bowlingAccuracy = totalBowls > 0 ? Math.round((successfulBowls / totalBowls) * 100) : 0;

      return {
        date,
        battingSuccess,
        bowlingAccuracy,
        ...battingTotal,
        ...bowlingTotal
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-800">Loading dashboard...</div>
      </div>
    );
  }

  const players = getAllPlayers();
  const teamOverview = getTeamOverview();
  const playerProgress = selectedPlayer ? getPlayerProgress(selectedPlayer) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Cricket Team Analytics</h1>
              <span className="text-sm text-gray-500">Exabyting Team</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              {user ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                    <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href="/mobile-entry" className="text-orange-600 hover:text-orange-800 text-sm bg-orange-50 px-2 py-1 rounded">
                      📱 Mobile Entry
                    </Link>
                    <Link href="/manage-players" className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-2 py-1 rounded">
                      Manage Players
                    </Link>
                    <Link href="/bulk-entry" className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-2 py-1 rounded">
                      Add Session
                    </Link>
                    <Link href="/live-scoring" className="text-green-600 hover:text-green-800 text-sm bg-green-50 px-2 py-1 rounded">
                      Live Scoring
                    </Link>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const { signOut } = await import('../../lib/auth');
                        await signOut();
                      } catch (error) {
                        console.error('Error signing out:', error);
                      }
                    }}
                    className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 w-full sm:w-auto"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <SignInModal />
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-4 sm:space-y-6">
            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">View Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setViewMode('team')}
                  className={`py-2 sm:py-1.5 px-3 sm:px-2 rounded-lg transition text-sm ${viewMode === 'team' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Team Overview
                </button>
                <button
                  onClick={() => setViewMode('individual')}
                  className={`py-2 sm:py-1.5 px-3 sm:px-2 rounded-lg transition text-sm ${viewMode === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Individual Progress
                </button>
              </div>
            </div>

            {/* Filter Mode */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">Data Filter</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFilterMode('overall')}
                  className={`py-2 sm:py-1.5 px-3 sm:px-2 rounded-lg transition text-sm ${filterMode === 'overall' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Overall
                </button>
                <button
                  onClick={() => setFilterMode('date')}
                  className={`py-2 sm:py-1.5 px-3 sm:px-2 rounded-lg transition text-sm ${filterMode === 'date' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  By Date
                </button>
              </div>
            </div>

            {/* Date Selection */}
            {filterMode === 'date' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Select Date</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Choose Date</option>
                  {getAvailableDates().map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Player Selection for Individual View */}
            {viewMode === 'individual' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Select Player</label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Choose Player</option>
                  {players.map(player => (
                    <option key={player} value={player}>{player}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Team Overview */}
        {viewMode === 'team' && (
          <div className="space-y-8">
            {/* Team Batting Performance */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
                Team Batting Performance {filterMode === 'date' && selectedDate ? `(${selectedDate})` : '(Overall)'}
              </h3>
              {teamOverview.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-3xl sm:text-4xl mb-4">🏏</div>
                  <p className="text-gray-500 text-sm sm:text-base">No batting data available</p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={300} minWidth={300} className="sm:!h-96">
                    <BarChart data={teamOverview} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis fontSize={10} />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        labelStyle={{ fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="goodHit" fill="#10B981" name="Good Hits" />
                      <Bar dataKey="defence" fill="#3B82F6" name="Defence" />
                      <Bar dataKey="missHit" fill="#EF4444" name="Miss Hits" />
                      <Bar dataKey="edgeBack" fill="#F59E0B" name="Edge Back" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Team Bowling Performance */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
                Team Bowling Performance {filterMode === 'date' && selectedDate ? `(${selectedDate})` : '(Overall)'}
              </h3>
              {teamOverview.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-3xl sm:text-4xl mb-4">⚾</div>
                  <p className="text-gray-500 text-sm sm:text-base">No bowling data available</p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={300} minWidth={300} className="sm:!h-96">
                    <BarChart data={teamOverview} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis fontSize={10} />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        labelStyle={{ fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="legal" fill="#10B981" name="Legal" />
                      <Bar dataKey="wide" fill="#EF4444" name="Wide" />
                      <Bar dataKey="short" fill="#F59E0B" name="Short" />
                      <Bar dataKey="fullToss" fill="#8B5CF6" name="Full Toss" />
                      <Bar dataKey="noBall" fill="#EC4899" name="No Ball" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Player Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Batting Rankings */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                    🏏 Batting Rankings {filterMode === 'date' && selectedDate ? `(${selectedDate})` : '(Overall)'}
                  </h3>
                  <div className="text-xs text-gray-500 hidden sm:block">Click player to view details</div>
                </div>
                {teamOverview.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-4">🏏</div>
                    <p className="text-gray-500 text-sm">No batting data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teamOverview
                      .filter(player => player.totalBalls > 0)
                      .sort((a, b) => b.successRate - a.successRate)
                      .map((player, index) => (
                        <div key={player.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                             onClick={() => {
                               setModalPlayerName(player.name);
                               setShowPlayerModal(true);
                             }}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-50 text-blue-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 text-sm sm:text-base hover:text-blue-600">{player.name}</div>
                              <div className="text-xs text-gray-500">
                                {player.totalBalls} balls • {player.goodHit + player.defence} good • {player.missHit + player.edgeBack} poor
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              player.successRate >= 80 ? 'text-green-600' :
                              player.successRate >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {player.successRate}%
                            </div>
                            <div className="text-xs text-gray-500">Success Rate</div>
                          </div>
                        </div>
                      ))}
                    {teamOverview.filter(player => player.totalBalls > 0).length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No batting data available for ranking
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bowling Rankings */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                    ⚾ Bowling Rankings {filterMode === 'date' && selectedDate ? `(${selectedDate})` : '(Overall)'}
                  </h3>
                  <div className="text-xs text-gray-500 hidden sm:block">Click player to view details</div>
                </div>
                {teamOverview.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-4">⚾</div>
                    <p className="text-gray-500 text-sm">No bowling data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teamOverview
                      .filter(player => player.totalBowls > 0)
                      .sort((a, b) => b.bowlingAccuracy - a.bowlingAccuracy)
                      .map((player, index) => (
                        <div key={player.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                             onClick={() => {
                               setModalPlayerName(player.name);
                               setShowPlayerModal(true);
                             }}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-50 text-blue-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 text-sm sm:text-base hover:text-blue-600">{player.name}</div>
                              <div className="text-xs text-gray-500">
                                {player.totalBowls} balls • {player.legal + player.short + player.fullToss} good • {player.wide + player.noBall} poor
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              player.bowlingAccuracy >= 80 ? 'text-green-600' :
                              player.bowlingAccuracy >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {player.bowlingAccuracy}%
                            </div>
                            <div className="text-xs text-gray-500">Accuracy</div>
                          </div>
                        </div>
                      ))}
                    {teamOverview.filter(player => player.totalBowls > 0).length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No bowling data available for ranking
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Individual Progress */}
        {viewMode === 'individual' && selectedPlayer && (
          <div className="space-y-8">
            {/* Progress Over Time */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
                {selectedPlayer} - Performance Progress Over Time
              </h3>
              {playerProgress.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-3xl sm:text-4xl mb-4">📈</div>
                  <p className="text-gray-500 text-sm sm:text-base">No progress data available</p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={300} minWidth={300} className="sm:!h-96">
                    <LineChart data={playerProgress} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis fontSize={10} />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        labelStyle={{ fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="battingSuccess" stroke="#10B981" strokeWidth={2} name="Batting Success %" />
                      <Line type="monotone" dataKey="bowlingAccuracy" stroke="#3B82F6" strokeWidth={2} name="Bowling Accuracy %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Individual Batting Details */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
                {selectedPlayer} - Batting Performance by Date
              </h3>
              {playerProgress.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-3xl sm:text-4xl mb-4">🏏</div>
                  <p className="text-gray-500 text-sm sm:text-base">No batting data available</p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={300} minWidth={300} className="sm:!h-96">
                    <BarChart data={playerProgress} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis fontSize={10} />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        labelStyle={{ fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="goodHit" fill="#10B981" name="Good Hits" />
                      <Bar dataKey="defence" fill="#3B82F6" name="Defence" />
                      <Bar dataKey="missHit" fill="#EF4444" name="Miss Hits" />
                      <Bar dataKey="edgeBack" fill="#F59E0B" name="Edge Back" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Individual Bowling Details */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
                {selectedPlayer} - Bowling Performance by Date
              </h3>
              {playerProgress.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-3xl sm:text-4xl mb-4">⚾</div>
                  <p className="text-gray-500 text-sm sm:text-base">No bowling data available</p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={300} minWidth={300} className="sm:!h-96">
                    <BarChart data={playerProgress} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis fontSize={10} />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        labelStyle={{ fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="legal" fill="#10B981" name="Legal" />
                      <Bar dataKey="wide" fill="#EF4444" name="Wide" />
                      <Bar dataKey="short" fill="#F59E0B" name="Short" />
                      <Bar dataKey="fullToss" fill="#8B5CF6" name="Full Toss" />
                      <Bar dataKey="noBall" fill="#EC4899" name="No Ball" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-6 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Recent Practice Sessions</h3>
          <div className="space-y-4">
            {sessions.slice(0, 10).map(session => (
              <div key={session.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{session.date}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Added by: {session.createdByEmail}
                    </p>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {session.players.length} player entries
                    </span>
                  </div>
                  
                  {user && user.email === 'nhremon8181@gmail.com' && (
                    <button
                      onClick={() => deleteSession(session.id, session.date)}
                      className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition duration-200 flex items-center justify-center space-x-1 w-full sm:w-auto"
                      title="Delete this practice session"
                    >
                      <span>🗑️</span>
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-500 mb-2">No practice sessions yet</p>
                <p className="text-sm text-gray-400">Add your first practice session to get started</p>
              </div>
            )}
            
            {sessions.length > 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Showing 10 most recent sessions. Total: {sessions.length} sessions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Details Modal */}
      {showPlayerModal && modalPlayerName && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 pr-4">{modalPlayerName} - Performance Details</h2>
                <button
                  onClick={() => setShowPlayerModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none flex-shrink-0 w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {(() => {
                const playerData = teamOverview.find(p => p.name === modalPlayerName);
                if (!playerData) return <div>Player data not found</div>;

                return (
                  <>
                    {/* Overall Stats Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-3 flex items-center text-base">
                          🏏 Batting Performance
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Success Rate:</span>
                            <span className={`font-bold text-lg ${
                              playerData.successRate >= 80 ? 'text-green-600' :
                              playerData.successRate >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>{playerData.successRate}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Total Balls:</span>
                            <span className="font-medium text-gray-800">{playerData.totalBalls}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-3 flex items-center text-base">
                          ⚾ Bowling Performance
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Accuracy:</span>
                            <span className={`font-bold text-lg ${
                              playerData.bowlingAccuracy >= 80 ? 'text-green-600' :
                              playerData.bowlingAccuracy >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>{playerData.bowlingAccuracy}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Total Balls:</span>
                            <span className="font-medium text-gray-800">{playerData.totalBowls}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Batting Breakdown */}
                    {playerData.totalBalls > 0 && (
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-4 text-base">🏏 Batting Breakdown</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-green-100 p-4 rounded-lg text-center border border-green-200">
                            <div className="text-2xl font-bold text-green-800 mb-1">{playerData.goodHit}</div>
                            <div className="text-sm font-medium text-green-700 mb-1">Good Hits</div>
                            <div className="text-xs text-gray-600">{playerData.totalBalls > 0 ? Math.round((playerData.goodHit / playerData.totalBalls) * 100) : 0}%</div>
                          </div>
                          <div className="bg-blue-100 p-4 rounded-lg text-center border border-blue-200">
                            <div className="text-2xl font-bold text-blue-800 mb-1">{playerData.defence}</div>
                            <div className="text-sm font-medium text-blue-700 mb-1">Defence</div>
                            <div className="text-xs text-gray-600">{playerData.totalBalls > 0 ? Math.round((playerData.defence / playerData.totalBalls) * 100) : 0}%</div>
                          </div>
                          <div className="bg-red-100 p-4 rounded-lg text-center border border-red-200">
                            <div className="text-2xl font-bold text-red-800 mb-1">{playerData.missHit}</div>
                            <div className="text-sm font-medium text-red-700 mb-1">Miss Hits</div>
                            <div className="text-xs text-gray-600">{playerData.totalBalls > 0 ? Math.round((playerData.missHit / playerData.totalBalls) * 100) : 0}%</div>
                          </div>
                          <div className="bg-orange-100 p-4 rounded-lg text-center border border-orange-200">
                            <div className="text-2xl font-bold text-orange-800 mb-1">{playerData.edgeBack}</div>
                            <div className="text-sm font-medium text-orange-700 mb-1">Edge Back</div>
                            <div className="text-xs text-gray-600">{playerData.totalBalls > 0 ? Math.round((playerData.edgeBack / playerData.totalBalls) * 100) : 0}%</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detailed Bowling Breakdown */}
                    {playerData.totalBowls > 0 && (
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-4 text-base">⚾ Bowling Breakdown</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          <div className="bg-green-100 p-4 rounded-lg text-center border border-green-200">
                            <div className="text-2xl font-bold text-green-800 mb-1">{playerData.legal}</div>
                            <div className="text-sm font-medium text-green-700 mb-1">Legal</div>
                            <div className="text-xs text-gray-600">{playerData.totalBowls > 0 ? Math.round((playerData.legal / playerData.totalBowls) * 100) : 0}%</div>
                          </div>
                          <div className="bg-purple-100 p-4 rounded-lg text-center border border-purple-200">
                            <div className="text-2xl font-bold text-purple-800 mb-1">{playerData.fullToss}</div>
                            <div className="text-sm font-medium text-purple-700 mb-1">Full Toss</div>
                            <div className="text-xs text-gray-600">{playerData.totalBowls > 0 ? Math.round((playerData.fullToss / playerData.totalBowls) * 100) : 0}%</div>
                          </div>
                          <div className="bg-yellow-100 p-4 rounded-lg text-center border border-yellow-200">
                            <div className="text-2xl font-bold text-yellow-800 mb-1">{playerData.short}</div>
                            <div className="text-sm font-medium text-yellow-700 mb-1">Short</div>
                            <div className="text-xs text-gray-600">{playerData.totalBowls > 0 ? Math.round((playerData.short / playerData.totalBowls) * 100) : 0}%</div>
                          </div>
                          <div className="bg-red-100 p-4 rounded-lg text-center border border-red-200">
                            <div className="text-2xl font-bold text-red-800 mb-1">{playerData.wide}</div>
                            <div className="text-sm font-medium text-red-700 mb-1">Wide</div>
                            <div className="text-xs text-gray-600">{playerData.totalBowls > 0 ? Math.round((playerData.wide / playerData.totalBowls) * 100) : 0}%</div>
                          </div>
                          <div className="bg-red-100 p-4 rounded-lg text-center border border-red-200">
                            <div className="text-2xl font-bold text-red-800 mb-1">{playerData.noBall}</div>
                            <div className="text-sm font-medium text-red-700 mb-1">No Ball</div>
                            <div className="text-xs text-gray-600">{playerData.totalBowls > 0 ? Math.round((playerData.noBall / playerData.totalBowls) * 100) : 0}%</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Success Rate Explanation */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 text-base">📊 How Success Rates Are Calculated</h4>
                      <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                        <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                          <strong className="text-gray-800">Batting Success Rate:</strong> (Good Hits + Defence) ÷ Total Balls × 100
                        </div>
                        <div className="bg-white p-3 rounded border-l-4 border-green-500">
                          <strong className="text-gray-800">Bowling Accuracy:</strong> (Legal + Short + Full Toss) ÷ Total Balls × 100
                        </div>
                      </div>
                    </div>

                    {/* View Full Progress Button */}
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setSelectedPlayer(modalPlayerName);
                          setViewMode('individual');
                          setShowPlayerModal(false);
                        }}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        📈 View Full Progress Over Time
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}