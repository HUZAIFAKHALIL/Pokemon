import { createClient } from "@supabase/supabase-js"
import type { Pokemon, Team } from "@/types/pokemon"

const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

let supabase: any = null
if (isSupabaseConfigured()) {
  try {
    supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  } catch (error) {
    console.log("Supabase not available, using localStorage fallback")
  }
}

const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export async function searchPokemonFromAPI(query: string): Promise<Pokemon[]> {
  try {
    const searchQuery = query.toLowerCase().trim()

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchQuery}`)

      if (response.ok) {
        const pokemonData = await response.json()
        const pokemon = await formatPokemonData(pokemonData)
        return [pokemon]
      }
    } catch (exactMatchError) {
      console.log("Exact match failed, trying partial search...")
    }

    const listResponse = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1500")
    if (!listResponse.ok) {
      throw new Error("Failed to fetch Pokemon list")
    }

    const listData = await listResponse.json()

    const exactMatches = listData.results.filter((pokemon: any) => pokemon.name.startsWith(searchQuery))
    const partialMatches = listData.results.filter(
      (pokemon: any) => pokemon.name.includes(searchQuery) && !pokemon.name.startsWith(searchQuery),
    )

    const allMatches = [...exactMatches, ...partialMatches].slice(0, 12)

    if (allMatches.length === 0) {
      return []
    }

    const pokemonPromises = allMatches.map(async (match: any) => {
      try {
        const detailResponse = await fetch(match.url)
        if (!detailResponse.ok) {
          throw new Error(`Failed to fetch details for ${match.name}`)
        }

        const detailData = await detailResponse.json()
        const pokemon = await formatPokemonData(detailData)
        return pokemon
      } catch (error) {
        console.error(`Error fetching ${match.name}:`, error)
        return null
      }
    })

    const pokemonResults = await Promise.all(pokemonPromises)
    return pokemonResults.filter((pokemon): pokemon is Pokemon => pokemon !== null)
  } catch (error) {
    console.error("Error searching Pokémon:", error)
    throw new Error("Failed to search Pokémon. Please try again.")
  }
}

async function formatPokemonData(pokemonData: any): Promise<Pokemon> {
  const getImage = () => {
    const sprites = pokemonData.sprites
    return (
      sprites.other?.["official-artwork"]?.front_default ||
      sprites.other?.dream_world?.front_default ||
      sprites.other?.home?.front_default ||
      sprites.front_default ||
      null
    )
  }

  return {
    id: pokemonData.id,
    name: pokemonData.name,
    image: getImage(),
    types: pokemonData.types.map((type: any) => type.type.name),
    base_experience: pokemonData.base_experience || 0,
  }
}

export async function getTeams(userId = "default_user"): Promise<Team[]> {
  if (supabase) {
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select(`
          id,
          name,
          created_at,
          team_pokemon (
            pokemon_id,
            position,
            pokemon (
              id,
              name,
              image,
              types,
              base_experience
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: true })

      if (teamsError) {
        console.error("Database error:", teamsError)
        throw new Error("Failed to fetch teams from database")
      }

      const teams: Team[] = teamsData.map((team: { id: any; name: any; team_pokemon: any[] }) => ({
        id: team.id,
        name: team.name,
        pokemon: team.team_pokemon
          .sort((a, b) => a.position - b.position)
          .map((tp) => tp.pokemon as Pokemon)
          .filter(Boolean),
      }))

      return teams
    } catch (error) {
      console.error("Supabase error, falling back to localStorage:", error)
    }
  }

  if (typeof window !== "undefined") {
    const savedTeams = localStorage.getItem("pokemon-teams")
    if (savedTeams) {
      try {
        return JSON.parse(savedTeams)
      } catch (error) {
        console.error("Error parsing saved teams:", error)
        localStorage.removeItem("pokemon-teams")
      }
    }
  }

  return []
}

export async function createTeam(name: string, userId = "default_user"): Promise<Team> {
  const newTeam: Team = {
    id: generateId(),
    name: name.trim(),
    pokemon: [],
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("teams")
        .insert({
          id: newTeam.id,
          name: name.trim(),
          user_id: userId,
        })
        .select()
        .single()

      if (!error) {
        return {
          id: data.id,
          name: data.name,
          pokemon: [],
        }
      }
    } catch (error) {
      console.error("Supabase error, falling back to localStorage:", error)
    }
  }

  if (typeof window !== "undefined") {
    const teams = await getTeams(userId)
    const updatedTeams = [...teams, newTeam]
    localStorage.setItem("pokemon-teams", JSON.stringify(updatedTeams))
  }

  return newTeam
}

export async function updateTeamName(teamId: string, name: string): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("teams")
        .update({
          name: name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", teamId)

      if (!error) {
        return
      }
    } catch (error) {
      console.error("Supabase error, falling back to localStorage:", error)
    }
  }

  if (typeof window !== "undefined") {
    const teams = await getTeams()
    const updatedTeams = teams.map((team) => (team.id === teamId ? { ...team, name: name.trim() } : team))
    localStorage.setItem("pokemon-teams", JSON.stringify(updatedTeams))
  }
}

export async function deleteTeam(teamId: string): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from("teams").delete().eq("id", teamId)
      if (!error) {
        return
      }
    } catch (error) {
      console.error("Supabase error, falling back to localStorage:", error)
    }
  }

  if (typeof window !== "undefined") {
    const teams = await getTeams()
    const updatedTeams = teams.filter((team) => team.id !== teamId)
    localStorage.setItem("pokemon-teams", JSON.stringify(updatedTeams))
  }
}

export async function addPokemonToTeam(teamId: string, pokemon: Pokemon): Promise<void> {
  const teams = await getTeams()
  const team = teams.find((t) => t.id === teamId)

  if (!team) {
    throw new Error("Team not found")
  }

  if (team.pokemon.length >= 6) {
    throw new Error("Team is full (maximum 6 Pokémon)")
  }

  if (team.pokemon.some((p) => p.id === pokemon.id)) {
    throw new Error("This Pokémon is already in your team")
  }

  if (supabase) {
    try {
      await supabase.from("pokemon").upsert({
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.image,
        types: pokemon.types,
        base_experience: pokemon.base_experience,
      })

      const { error } = await supabase.from("team_pokemon").insert({
        team_id: teamId,
        pokemon_id: pokemon.id,
        position: team.pokemon.length + 1,
      })

      if (!error) {
        return
      }
    } catch (error) {
      console.error("Supabase error, falling back to localStorage:", error)
    }
  }

  if (typeof window !== "undefined") {
    const updatedTeams = teams.map((t) => (t.id === teamId ? { ...t, pokemon: [...t.pokemon, pokemon] } : t))
    localStorage.setItem("pokemon-teams", JSON.stringify(updatedTeams))
  }
}

export async function removePokemonFromTeam(teamId: string, pokemonId: number): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from("team_pokemon").delete().eq("team_id", teamId).eq("pokemon_id", pokemonId)

      if (!error) {
        return
      }
    } catch (error) {
      console.error("Supabase error, falling back to localStorage:", error)
    }
  }

  if (typeof window !== "undefined") {
    const teams = await getTeams()
    const updatedTeams = teams.map((team) =>
      team.id === teamId ? { ...team, pokemon: team.pokemon.filter((p) => p.id !== pokemonId) } : team,
    )
    localStorage.setItem("pokemon-teams", JSON.stringify(updatedTeams))
  }
}
