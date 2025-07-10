import { type NextRequest, NextResponse } from "next/server"
import { getTeams, createTeam } from "@/lib/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "default_user"

    const teams = await getTeams(userId)
    return NextResponse.json({ teams })
  } catch (error) {
    console.error("Error in GET /api/teams:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch teams"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, userId = "default_user" } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    const team = await createTeam(name.trim(), userId)
    return NextResponse.json({ team })
  } catch (error) {
    console.error("Error in POST /api/teams:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create team"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
