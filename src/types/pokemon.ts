export interface Pokemon {
  id: number
  name: string
  image: string
  types: string[]
  base_experience: number
}

export interface Team {
  id: string
  name: string
  pokemon: Pokemon[]
}
