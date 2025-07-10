"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import type { Team } from "@/types/pokemon"

interface TeamSelectorProps {
  teams: Team[]
  activeTeamId: string
  onTeamSelect: (teamId: string) => void
  onCreateTeam: (name: string) => void
  onDeleteTeam: (teamId: string) => void
  onRenameTeam: (teamId: string, newName: string) => void
}

export default function TeamSelector({
  teams,
  activeTeamId,
  onTeamSelect,
  onCreateTeam,
  onDeleteTeam,
  onRenameTeam,
}: TeamSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTeamName.trim()) {
      onCreateTeam(newTeamName.trim())
      setNewTeamName("")
      setShowCreateForm(false)
    }
  }

  const handleRenameTeam = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingName.trim() && editingTeamId) {
      onRenameTeam(editingTeamId, editingName.trim())
      setEditingTeamId(null)
      setEditingName("")
    }
  }

  const startEditing = (team: Team) => {
    setEditingTeamId(team.id)
    setEditingName(team.name)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Teams</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Team
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateTeam} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
              autoFocus
            />
            <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium">
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false)
                setNewTeamName("")
              }}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

  
      <div className="space-y-2">
        {teams.map((team) => (
          <div
            key={team.id}
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
              team.id === activeTeamId
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="flex-1 min-w-0">
              {editingTeamId === team.id ? (
                <form onSubmit={handleRenameTeam} className="flex gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                    autoFocus
                  />
                  <button type="submit" className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeamId(null)
                      setEditingName("")
                    }}
                    className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="cursor-pointer" onClick={() => onTeamSelect(team.id)}>
                  <h3 className="font-medium text-gray-800 dark:text-white truncate">{team.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{team.pokemon.length}/6 Pokémon</p>
                </div>
              )}
            </div>

            {editingTeamId !== team.id && (
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => startEditing(team)}
                  className="p-1 text-gray-500 hover:text-blue-500 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Rename team"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {teams.length > 1 && (
                  <button
                    onClick={() => onDeleteTeam(team.id)}
                    className="p-1 text-gray-500 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    title="Delete team"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
