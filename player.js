class Player extends Sprite {
    constructor({
        collisionBlocks = [], imageSrc, frameRate, animation, loop
    }) {
        super({ imageSrc, frameRate, animation, loop })
        this.position = {
            x: 200,
            y: 200,
        }
        this.velocity = {
            x: 0,
            y: 0,
        }

        // this.width = 25
        // this.height = 25

        this.side = {
            bottom: this.position.y + this.height
        }
        this.gravity = 1

        this.collisionBlocks = collisionBlocks
        console.log(this.collisionBlocks)
    }



    update() {

        this.position.x += this.velocity.x

        this.updateHitBox()

        this.checkforhorizontalcollision()
        this.applygravity()

        this.updateHitBox()

        this.checkforverticlecollision()
    }

    handleInput(keys){
        if (this.preventInput) return
        this.velocity.x = 0
        if (keys.d.pressed) {
            this.switchSprite('runRight')
            this.velocity.x = 5
            this.lastDirection = 'right'
        }
        else if (keys.a.pressed) {
            this.switchSprite('runLeft')
            this.velocity.x = -5
            this.lastDirection = 'left'
        }
        else {
            if(this.lastDirection === 'left')
            this.switchSprite('idleLeft')
        else
            this.switchSprite('idleRight')
        }
    }

    switchSprite(name){
        if(this.image === this.animation[name].image) return
        this.currentFrame = 0
        this.image = this.animation[name].image
        this.frameRate = this.animation[name].frameRate
        this.frameBuffer = this.animation[name].frameBuffer
        this.loop = this.animation[name].loop
        this.currentAnimation = this.animation[name]
    }

    updateHitBox(){
        this.hitBox = {
            position: {
                x: this.position.x + 58,
                y: this.position.y + 34,
            },
            width: 50,
            height: 53,
        }
    }
    checkforhorizontalcollision() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i]
            // if a collision exist
            if (this.hitBox.position.x <= collisionBlock.position.x + collisionBlock.width &&
                this.hitBox.position.x + this.hitBox.width >= collisionBlock.position.x &&
                this.hitBox.position.y + this.hitBox.height >= collisionBlock.position.y &&
                this.hitBox.position.y <= collisionBlock.position.y + collisionBlock.height
            ) {
                //collision on x axis going to the left
                if (this.velocity.x < 0) {
                    const offset = this.hitBox.position.x - this.position.x
                    this.position.x = collisionBlock.position.x + collisionBlock.width - offset + 0.01
                    break
                }

                if (this.velocity.x > 0) {
                    const offset = this.hitBox.position.x - this.position.x + this.hitBox.width;
                    this.position.x = collisionBlock.position.x  - offset - 0.01
                    break
                }
            }
        }
    }
    applygravity() {
        this.velocity.y += this.gravity
        this.position.y += this.velocity.y
    }
    checkforverticlecollision() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i]
            // if a collision exist
            if (this.hitBox.position.x <= collisionBlock.position.x + collisionBlock.width &&
                this.hitBox.position.x + this.hitBox.width >= collisionBlock.position.x &&
                this.hitBox.position.y + this.hitBox.height >= collisionBlock.position.y &&
                this.hitBox.position.y <= collisionBlock.position.y + collisionBlock.height
            ) {
                //collision on y axis going to the left
                if (this.velocity.y < 0) {
                    this.velocity.y = 0
                    const offset = this.hitBox.position.y - this.position.y
                    this.position.y = collisionBlock.position.y + collisionBlock.height - offset + 0.01
                    break
                }

                if (this.velocity.y > 0) {
                    this.velocity.y = 0
                    const offset = this.hitBox.position.y - this.position.y + this.hitBox.height;
                    this.position.y = collisionBlock.position.y - offset - 0.01
                    break
                }
            }



        }
    }
}

