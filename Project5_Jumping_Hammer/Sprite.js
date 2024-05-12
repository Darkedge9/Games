class Sprite {
    constructor({ position, imageSrc, frameRate = 1, animation , frameBuffer = 2, loop = true,autoplay = true,}) {
        this.position = position;
        this.image = new Image();
        this.image.onload = () => {
            this.loaded = true
            this.width = this.image.width / this.frameRate
            this.height = this.image.height

        }
        this.image.src = imageSrc
        this.loaded = false
        this.frameRate = frameRate
        this.currentFrame = 0
        this.elapsedFrames = 0
        this.frameBuffer = frameBuffer
        this.animation = animation
        this.loop = loop
        this.autoplay = autoplay
        this.currentAnimation

        if(this.animation){
            for(let key in this.animation){
                const image = new Image()
                image.src = this.animation[key].imageSrc
                this.animation[key].image = image
            }
            console.log(this.animation)
        }
    }
    draw() {
        if (!this.loaded) return
        const cropbox = {
            position: {
                x: this.width * this.currentFrame,
                y: 0,
            },
            width: this.width,
            height: this.height,
        }
        c.drawImage(this.image, cropbox.position.x, cropbox.position.y, cropbox.width, cropbox.height, this.position.x, this.position.y,
            this.width, this.height);

            this.updateFrames()
    }
    play(){
        this.autoplay = true
    }

    updateFrames(){
        if(!this.autoplay) return

        this.elapsedFrames++
        if(this.elapsedFrames % this.frameBuffer === 0) {
        if(this.currentFrame< this.frameRate - 1) this.currentFrame++
        else if(this.loop)this.currentFrame = 0
    }
    if(this.currentAnimation?.onComplete){
        if(this.currentFrame === this.frameRate - 1 && !this.currentAnimation.isActive){
        this.currentAnimation.onComplete()
        this.currentAnimation.isActive = true
        }
    }
    }
}