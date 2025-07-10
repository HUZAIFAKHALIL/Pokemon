import { type NextRequest, NextResponse } from "next/server"
import { searchPokemonFromAPI } from "@/lib/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const pokemon = await searchPokemonFromAPI(query.trim())
    return NextResponse.json({ pokemon })
  } catch (error) {
    console.error("Error in GET /api/pokemon/search:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to search Pokémon"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
