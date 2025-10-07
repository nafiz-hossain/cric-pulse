'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  position?: string;
  joinDate: string;
  isActive: boolean;
}

export default function ManagePlayers() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'players'));
      const playersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Player[];
      setPlayers(playersData.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching players:', error);
      setLoading(false);
    }
  };

  const addPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    setSaving(true);
    try {
      await addDoc(collection(db, 'players'), {
        name: newPlayerName.trim(),
        position: newPlayerPosition.trim() || 'All-rounder',
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true,
        createdBy: user?.email,
        createdAt: new Date().toISOString()
      });

      setNewPlayerName('');
      setNewPlayerPosition('');
      await fetchPlayers();
      alert('✅ Player added successfully!');
    } catch (error: any) {
      console.error('Error adding player:', error);
      alert(`❌ Error adding player: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const togglePlayerStatus = async (playerId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'players', playerId), {
        isActive: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      await fetchPlayers();
    } catch (error) {
      console.error('Error updating player status:', error);
      alert('Error updating player status');
    }
  };

  const deletePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Are you sure you want to delete ${playerName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'players', playerId));
      await fetchPlayers();
      alert('✅ Player deleted successfully!');
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('❌ Error deleting player');
    }
  };

  if (!user || user.email !== 'nhremon8181@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h2>
          <p className="mb-4 text-gray-600">Only authorized managers can manage players.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-800">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Team Players</h1>
          <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto text-center">
            Back to Home
          </Link>
        </div>

        {/* Add New Player */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Add New Player</h2>

          <form onSubmit={addPlayer} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Player Name *</label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Enter player name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Position</label>
                <select
                  value={newPlayerPosition}
                  onChange={(e) => setNewPlayerPosition(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select Position</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicket-keeper">Wicket-keeper</option>
                  <option value="Captain">Captain</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !newPlayerName.trim()}
              className="w-full sm:w-auto bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {saving ? 'Adding Player...' : '➕ Add Player'}
            </button>
          </form>
        </div>

        {/* Current Players List */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Current Team Players ({players.length})</h2>

          {players.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No players added yet.</p>
              <p className="text-sm text-gray-400">Add your first player using the form above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {players.map(player => (
                <div key={player.id} className={`border rounded-lg p-4 ${player.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{player.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${player.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {player.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2 text-sm text-gray-600">
                        <span>📍 {player.position || 'All-rounder'}</span>
                        <span>📅 Joined: {player.joinDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => togglePlayerStatus(player.id, player.isActive)}
                        className={`py-2 px-3 rounded text-xs sm:text-sm font-medium ${player.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                      >
                        {player.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => deletePlayer(player.id, player.name)}
                        className="py-2 px-3 rounded text-xs sm:text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link href="/mobile-entry">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition duration-200 cursor-pointer border-l-4 border-orange-500">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">📱 Mobile Entry</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Quick tap-to-add stats on mobile devices
              </p>
            </div>
          </Link>

          <Link href="/add-session">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition duration-200 cursor-pointer">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">📊 Add Practice Session</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Record batting and bowling statistics for your players
              </p>
            </div>
          </Link>

          <Link href="/dashboard">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition duration-200 cursor-pointer">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">📈 View Dashboard</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Analyze team and individual player performance
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}