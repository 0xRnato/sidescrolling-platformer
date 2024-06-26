const createKey = (name: string, id: number) => `${name}-${id}`

export default class ObstaclesController {
  private obstacles = new Map<string, MatterJS.BodyType>()

  add(name: string, body: MatterJS.BodyType) {
    const key = createKey(name, body.id)
    if (this.obstacles.has(key)) throw new Error('Obstacle already exists at this key.')
    this.obstacles.set(key, body)
  }

  is(name: string, body: MatterJS.BodyType) {
    const key = createKey(name, body.id)
    if (!this.obstacles.has(key)) {
      return false
    }
    return true
  }
}
