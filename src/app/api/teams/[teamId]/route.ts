import { type NextRequest, NextResponse } from "next/server"
import { updateTeamName, deleteTeam } from "@/lib/api"

export async function PUT(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    await updateTeamName(params.teamId, name.trim())
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT /api/teams/[teamId]:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update team"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    await deleteTeam(params.teamId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/teams/[teamId]:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete team"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
