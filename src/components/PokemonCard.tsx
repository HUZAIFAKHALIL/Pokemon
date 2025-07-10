"use client"

import Image from "next/image"
import { useState } from "react"
import LoadingSpinner from "./LoadingSpinner"
import type { Pokemon } from "@/types/pokemon"

interface PokemonCardProps {
  pokemon: Pokemon
  onAddToTeam: (pokemon: Pokemon) => void
  isInTeam: boolean
  isTeamFull: boolean
}

const typeColors: { [key: string]: string } = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-blue-300",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-green-400",
  rock: "bg-yellow-800",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-800",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
}

export default function PokemonCard({ pokemon, onAddToTeam, isInTeam, isTeamFull }: PokemonCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleAddToTeam = async () => {
    if (isInTeam || isTeamFull || adding) return

    setAdding(true)
    try {
      await onAddToTeam(pokemon)
    } finally {
      setAdding(false)
    }
  }

  const formatPokemonId = (id: number) => {
    return `#${id.toString().padStart(3, "0")}`
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500">
      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">{formatPokemonId(pokemon.id)}</div>

      <div className="text-center mb-4 relative">
        {pokemon.image && !imageError ? (
          <div className="relative">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size="medium" />
              </div>
            )}
            <Image
              src={pokemon.image || "/placeholder.svg"}
              alt={pokemon.name}
              width={120}
              height={120}
              className={`mx-auto transition-opacity duration-200 ${imageLoading ? "opacity-0" : "opacity-100"}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
              priority={false}
              unoptimized={true}
            />
          </div>
        ) : (
          <div className="w-[120px] h-[120px] mx-auto bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-2xl">?</span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-800 dark:text-white capitalize text-center mb-3">
        {capitalizeFirst(pokemon.name)}
      </h3>

      <div className="flex flex-wrap gap-1 justify-center mb-3">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
              typeColors[type] || "bg-gray-400"
            } shadow-sm`}
          >
            {capitalizeFirst(type)}
          </span>
        ))}
      </div>

      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Base Experience:</span> {pokemon.base_experience || "Unknown"}
        </p>
      </div>

      <button
        onClick={handleAddToTeam}
        disabled={isInTeam || isTeamFull || adding}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
          isInTeam
            ? "bg-green-500 text-white cursor-not-allowed"
            : isTeamFull
              ? "bg-gray-400 text-white cursor-not-allowed"
              : adding
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md transform hover:scale-105"
        }`}
      >
        {adding ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner size="small" className="mr-2" showGif={false} />
            Adding...
          </div>
        ) : isInTeam ? (
          "✓ In Team"
        ) : isTeamFull ? (
          "Team Full"
        ) : (
          "Add to Team"
        )}
      </button>
    </div>
  )
}
