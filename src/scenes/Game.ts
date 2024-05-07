import Phaser from 'phaser';
import PlayerController from './PlayerController';
import ObstaclesController from './ObstaclesController';

export class Game extends Phaser.Scene {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private penguin?: Phaser.Physics.Matter.Sprite
  private playerController?: PlayerController
  private obstacles!: ObstaclesController

  constructor() {
    super('game');
  }

  init() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.obstacles = new ObstaclesController();
  }

  preload() {
    this.load.atlas('penguin', 'assets/penguin.png', 'assets/penguin.json');
    this.load.image('tiles', 'assets/sheet.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/iceworld.json');

    this.load.image('star', 'assets/star.png');
  }

  create() {
    this.scene.launch('ui')

    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('iceworld', 'tiles');
    const ground = map.createLayer('ground', tileset!);
    ground?.setCollisionByProperty({ collides: true });

    map.createLayer('obstacles', tileset!);

    const objectsLayer = map.getObjectLayer('objects');
    objectsLayer?.objects.forEach((objectData) => {
      const { x = 0, y = 0, name, width = 0, height = 0 } = objectData
      switch (name) {
        case 'penguin-spawn':
          this.penguin = this.matter.add
            .sprite(x + (width * 0.5), y, 'penguin')
            .setFixedRotation();

          this.playerController = new PlayerController(this, this.penguin, this.cursors, this.obstacles)

          this.cameras.main.startFollow(this.penguin)
          break
        case 'star':
          const star = this.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'star', undefined, {
            isStatic: true,
            isSensor: true
          })
          star.setData('type', 'star')
          break
        case 'spikes':
          const spike = this.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
            isStatic: true
          })
          this.obstacles.add('spikes', spike)
          break
      }
    })

    this.matter.world.convertTilemapLayer(ground!)
  }

  update(t: number, dt: number) {
    if (!this.playerController) return
    this.playerController.update(dt)
  }
}
