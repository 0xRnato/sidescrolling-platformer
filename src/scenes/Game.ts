import Phaser from 'phaser';

export class Game extends Phaser.Scene {
  constructor() {
    super('game');
  }

  preload() {
    this.load.atlas('penguin', 'assets/penguin.png', 'assets/penguin.json');
    this.load.image('tiles', 'assets/sheet.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/iceworld.json');
  }

  create() {
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('iceworld', 'tiles');
    const ground = map.createLayer('ground', tileset);

    this.cameras.main.scrollY = 300
  }
}
