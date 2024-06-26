import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine.ts'
import { sharedInstance as events } from './EventCenter.ts'
import ObstaclesController from './ObstaclesController.ts'

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys

export default class PlayerController {
  private scene: Phaser.Scene
  private sprite: Phaser.Physics.Matter.Sprite
  private cursors: CursorKeys
  private stateMachine: StateMachine
  private obstacles: ObstaclesController

  constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, cursors: CursorKeys, obstacles: ObstaclesController) {
    this.scene = scene
    this.sprite = sprite
    this.cursors = cursors
    this.obstacles = obstacles

    this.createAnimations()
    this.stateMachine = new StateMachine(this, 'player')

    this.stateMachine
      .addState('idle', {
        onEnter: this.idleOnEnter,
        onUpdate: this.idleOnUpdate
      })
      .addState('walk', {
        onEnter: this.walkOnEnter,
        onUpdate: this.walkOnUpdate
      })
      .addState('jump', {
        onEnter: this.jumpOnEnter,
        onUpdate: this.jumpOnUpdate
      })
      .addState('spike-hit', {
        onEnter: this.spikeHitOnEnter
      })
      .setState('idle')

    this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
      const body = data.bodyB as MatterJS.BodyType

      if (this.obstacles.is('spikes', body)) {
        this.stateMachine.setState('spike-hit')
        return
      }

      const gameObject = body.gameObject
      if (!gameObject) return

      if (gameObject instanceof Phaser.Physics.Matter.TileBody) {
        if (this.stateMachine.isCurrentState('jump')) {
          this.stateMachine.setState('idle')
        }
        return
      }

      const sprite = gameObject as Phaser.Physics.Matter.Sprite
      const type = sprite.getData('type')

      switch (type) {
        case 'star':
          events.emit('star-collected')
          sprite.destroy()
          break
      }
    })
  }

  update(dt: number) {
    this.stateMachine.update(dt)
  }

  private idleOnEnter() {
    this.sprite.play('player-idle')
  }

  private idleOnUpdate() {
    if (this.cursors.left.isDown || this.cursors.right.isDown) {
      this.stateMachine.setState('walk');
    }

    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (spaceJustPressed) {
      this.stateMachine.setState('jump')
    }
  }

  private walkOnEnter() {
    this.sprite.play('player-walk')
  }

  private walkOnUpdate() {
    const speed = 5;
    if (this.cursors.left.isDown) {
      this.sprite.flipX = true;
      this.sprite.setVelocityX(-speed);
    } else if (this.cursors?.right.isDown) {
      this.sprite.flipX = false;
      this.sprite.setVelocityX(speed);
    } else {
      this.sprite.setVelocityX(0);
      this.stateMachine.setState('idle');
    }

    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (spaceJustPressed) {
      this.stateMachine.setState('jump')
    }
  }

  private jumpOnEnter() {
    this.sprite.setVelocityY(-12);
  }

  private jumpOnUpdate() {
    const speed = 5;
    if (this.cursors.left.isDown) {
      this.sprite.flipX = true;
      this.sprite.setVelocityX(-speed);
    } else if (this.cursors?.right.isDown) {
      this.sprite.flipX = false;
      this.sprite.setVelocityX(speed);
    }
  }

  private spikeHitOnEnter() {
    this.sprite.setVelocityY(-12);

    const startColor = Phaser.Display.Color.ValueToColor(0xffffff)
    const endColor = Phaser.Display.Color.ValueToColor(0xff0000)

    this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 100,
      repeat: 2,
      yoyo: true,
      ease: Phaser.Math.Easing.Sine.InOut,
      onUpdate: tween => {
        const value = tween.getValue()
        const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
          startColor,
          endColor,
          100,
          value
        )

        const color = Phaser.Display.Color.GetColor(
          colorObject.r,
          colorObject.g,
          colorObject.b
        )

        this.sprite.setTint(color)
      }
    })
    this.stateMachine.setState('idle');
  }

  private createAnimations() {
    this.sprite.anims.create({
      key: 'player-idle',
      frames: [{ key: 'penguin', frame: 'penguin_walk01.png' }],
    })

    this.sprite.anims.create({
      key: 'player-walk',
      frameRate: 10,
      frames: this.sprite.anims.generateFrameNames('penguin', { start: 1, end: 4, prefix: 'penguin_walk0', suffix: '.png' }),
      repeat: -1
    })
  }
}
