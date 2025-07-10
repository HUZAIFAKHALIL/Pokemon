import { type NextRequest, NextResponse } from "next/server"
import { addPokemonToTeam, removePokemonFromTeam } from "@/lib/api"
import type { Pokemon } from "@/types/pokemon"

export async function POST(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const body = await request.json()
    const { pokemon }: { pokemon: Pokemon } = body

    if (!pokemon || !pokemon.id || !pokemon.name) {
      return NextResponse.json({ error: "Valid pokemon data is required" }, { status: 400 })
    }

    await addPokemonToTeam(params.teamId, pokemon)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/teams/[teamId]/pokemon:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to add Pokémon to team"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const pokemonId = searchParams.get("pokemonId")

    if (!pokemonId) {
      return NextResponse.json({ error: "Pokemon ID is required" }, { status: 400 })
    }

    await removePokemonFromTeam(params.teamId, Number.parseInt(pokemonId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/teams/[teamId]/pokemon:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to remove Pokémon from team"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
