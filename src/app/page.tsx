"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X } from "lucide-react"
import SearchBar from "@/components/SearchBar"
import PokemonCard from "@/components/PokemonCard"
import TeamSidebar from "@/components/TeamSidebar"
import TeamSelector from "@/components/TeamSelector"
import LoadingSpinner from "@/components/LoadingSpinner"
import type { Pokemon, Team } from "@/types/pokemon"

export default function Home() {
  const [searchResults, setSearchResults] = useState<Pokemon[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [activeTeamId, setActiveTeamId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadTeams()
    }
  }, [mounted])

  const loadTeams = async () => {
    try {
      setError(null)
      const response = await fetch("/api/teams")
      const data = await response.json()

      if (response.ok) {
        if (data.teams && data.teams.length > 0) {
          setTeams(data.teams)
          setActiveTeamId(data.teams[0].id)
        } else {
          await createNewTeam("My First Team")
        }
      } else {
        throw new Error(data.error || "Failed to load teams")
      }
    } catch (error) {
      console.error("Error loading teams:", error)
      setError("Failed to load teams. Please refresh the page.")
      await createNewTeam("My First Team")
    } finally {
      setInitialLoading(false)
    }
  }

  const activeTeam = teams.find((team) => team.id === activeTeamId)

  const searchPokemon = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchTerm("")
      return
    }

    setLoading(true)
    setSearchTerm(query)
    setError(null)

    try {
      const response = await fetch(`/api/pokemon/search?q=${encodeURIComponent(query.trim())}`)
      const data = await response.json()

      if (response.ok) {
        setSearchResults(data.pokemon || [])
        if (data.pokemon.length === 0) {
          setError(`No Pokémon found matching "${query}". Try a different name!`)
        }
      } else {
        throw new Error(data.error || "Search failed")
      }
    } catch (error) {
      console.error("Error searching Pokémon:", error)
      setError("Failed to search Pokémon. Please try again.")
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const addPokemonToTeam = async (pokemon: Pokemon) => {
    if (!activeTeam) {
      setError("No active team selected")
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/teams/${activeTeamId}/pokemon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pokemon }),
      })

      const data = await response.json()

      if (response.ok) {
        await loadTeams()
        setError(null)
      } else {
        setError(data.error || "Failed to add Pokémon to team")
      }
    } catch (error) {
      console.error("Error adding Pokémon to team:", error)
      setError("Failed to add Pokémon to team. Please try again.")
    }
  }

  const removePokemonFromTeam = async (pokemonId: number) => {
    if (!activeTeam) return

    try {
      setError(null)
      const response = await fetch(`/api/teams/${activeTeamId}/pokemon?pokemonId=${pokemonId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        await loadTeams()
      } else {
        setError(data.error || "Failed to remove Pokémon from team")
      }
    } catch (error) {
      console.error("Error removing Pokémon from team:", error)
      setError("Failed to remove Pokémon from team. Please try again.")
    }
  }

  const createNewTeam = async (name: string) => {
    try {
      setError(null)
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        await loadTeams()
        setActiveTeamId(data.team.id)
      } else {
        setError(data.error || "Failed to create team")
      }
    } catch (error) {
      console.error("Error creating team:", error)
      setError("Failed to create team. Please try again.")
    }
  }

  const deleteTeam = async (teamId: string) => {
    if (teams.length <= 1) {
      setError("You must have at least one team!")
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        await loadTeams()
        if (activeTeamId === teamId) {
          const remainingTeam = teams.find((t) => t.id !== teamId)
          if (remainingTeam) {
            setActiveTeamId(remainingTeam.id)
          }
        }
      } else {
        setError(data.error || "Failed to delete team")
      }
    } catch (error) {
      console.error("Error deleting team:", error)
      setError("Failed to delete team. Please try again.")
    }
  }

  const renameTeam = async (teamId: string, newName: string) => {
    if (!newName.trim()) {
      setError("Team name cannot be empty")
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        await loadTeams()
      } else {
        setError(data.error || "Failed to rename team")
      }
    } catch (error) {
      console.error("Error renaming team:", error)
      setError("Failed to rename team. Please try again.")
    }
  }

  const clearError = () => setError(null)

  if (!mounted) {
    return null
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" className="mx-auto mb-6" />
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading your Pokémon teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-2">🔥 Pokémon Team Builder</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Search for real Pokémon and build your ultimate team!
          </p>
        </header>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
              <button onClick={clearError} className="text-red-500 hover:text-red-700 dark:hover:text-red-300">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <TeamSelector
              teams={teams}
              activeTeamId={activeTeamId}
              onTeamSelect={setActiveTeamId}
              onCreateTeam={createNewTeam}
              onDeleteTeam={deleteTeam}
              onRenameTeam={renameTeam}
            />

            <SearchBar onSearch={searchPokemon} loading={loading} />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                {searchTerm ? `Search Results for "${searchTerm}"` : "🔍 Search for Pokémon"}
              </h2>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner size="medium" className="mr-3" />
                  <span className="text-gray-600 dark:text-gray-300">Searching Pokémon...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.map((pokemon) => (
                    <PokemonCard
                      key={pokemon.id}
                      pokemon={pokemon}
                      onAddToTeam={addPokemonToTeam}
                      isInTeam={activeTeam?.pokemon.some((p) => p.id === pokemon.id) || false}
                      isTeamFull={activeTeam?.pokemon.length === 6}
                    />
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">😔</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No Pokémon found for "{searchTerm}"</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Try searching for names like "pikachu", "charizard", or "bulbasaur"
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚡</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Start typing to search for Pokémon!</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Search by name to discover amazing Pokémon from the PokéAPI
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-1">
            <TeamSidebar team={activeTeam} onRemovePokemon={removePokemonFromTeam} />
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p className="mt-1">Developed by {" "}
            <a
              href="https://huzaifa-khalil-portfolio.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
            Huzaifa Khalil
            </a> 
            </p>
        </footer>
      </div>
    </div>
  )
}
