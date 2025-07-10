"use client"

import Image from "next/image"
import { useState } from "react"
import { X, BarChart3 } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"
import type { Team } from "@/types/pokemon"

interface TeamSidebarProps {
  team: Team | undefined
  onRemovePokemon: (pokemonId: number) => void
}

export default function TeamSidebar({ team, onRemovePokemon }: TeamSidebarProps) {
  const [removingId, setRemovingId] = useState<number | null>(null)

  if (!team) return null

  const totalTypes = new Set(team.pokemon.flatMap((p) => p.types)).size
  const averageBaseExperience =
    team.pokemon.length > 0
      ? Math.round(team.pokemon.reduce((sum, p) => sum + p.base_experience, 0) / team.pokemon.length)
      : 0

  const handleRemovePokemon = async (pokemonId: number) => {
    setRemovingId(pokemonId)
    try {
      await onRemovePokemon(pokemonId)
    } finally {
      setRemovingId(null)
    }
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const getTeamStrength = () => {
    if (team.pokemon.length === 0) return "Empty"
    if (team.pokemon.length <= 2) return "Weak"
    if (team.pokemon.length <= 4) return "Good"
    if (team.pokemon.length === 5) return "Strong"
    return "Complete"
  }

  const getStrengthColor = () => {
    const strength = getTeamStrength()
    switch (strength) {
      case "Empty":
        return "text-gray-500"
      case "Weak":
        return "text-red-500"
      case "Good":
        return "text-yellow-500"
      case "Strong":
        return "text-blue-500"
      case "Complete":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white truncate">{team.name}</h2>
        <span className={`text-sm font-medium ${getStrengthColor()}`}>{getTeamStrength()}</span>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Team Stats
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Pokémon:</span>
            <div className="flex items-center">
              <span className="font-medium text-gray-800 dark:text-white mr-2">{team.pokemon.length}/6</span>
              <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(team.pokemon.length / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Types Covered:</span>
            <span className="font-medium text-gray-800 dark:text-white">{totalTypes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Avg Base Exp:</span>
            <span className="font-medium text-gray-800 dark:text-white">{averageBaseExperience}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white flex items-center">👥 Team Members</h3>

        {team.pokemon.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-500 dark:text-gray-400">No Pokémon in team yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Search and add some!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {team.pokemon.map((pokemon, index) => (
              <div
                key={pokemon.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex-shrink-0">
                  {pokemon.image ? (
                    <Image
                      src={pokemon.image || "/placeholder.svg"}
                      alt={pokemon.name}
                      width={40}
                      height={40}
                      className="rounded"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-xs">?</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white capitalize truncate">
                    {capitalizeFirst(pokemon.name)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {pokemon.types.map(capitalizeFirst).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</span>
                  <button
                    onClick={() => handleRemovePokemon(pokemon.id)}
                    disabled={removingId === pokemon.id}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded transition-colors disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Remove from team"
                  >
                    {removingId === pokemon.id ? (
                      <LoadingSpinner size="small" showGif={false} />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {team.pokemon.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round((team.pokemon.length / 6) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(team.pokemon.length / 6) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}
