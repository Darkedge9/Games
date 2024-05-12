const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

let level = 1
let levels = {
    1: {
        init: () => {
            let collisionBlocks = []
            let parsedCollision = collisionLevel1.parse2D()
            parsedCollision.forEach((row, y) => {
                row.forEach((symbol, x) => {
                    if (symbol === 292) {

                        collisionBlocks.push(new CollisionBlock({
                            position: {
                                x: x * 64,
                                y: y * 64,
                            },
                        }))
                    }
                })

            })
            let backgroundlevel1 = new Sprite({
                position: {
                    x: 0,
                    y: 0,
                },
                imageSrc: 'backgroundLevel1.png'
            })
            let doors = [
                new Sprite({
                    position: {
                        x: 767,
                        y: 272,
                    },
                    imageSrc: 'doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                }),
            ]

        }

    },
    2: {
        init: () => {
            let collisionBlocks = []
            let parsedCollision = collisionLevel1.parse2D()
            parsedCollision.forEach((row, y) => {
                row.forEach((symbol, x) => {
                    if (symbol === 292) {

                        collisionBlocks.push(new CollisionBlock({
                            position: {
                                x: x * 64,
                                y: y * 64,
                            },
                        }))
                    }
                })

            })
            let backgroundlevel1 = new Sprite({
                position: {
                    x: 0,
                    y: 0,
                },
                imageSrc: 'backgroundLevel2.png'
            })
            let doors = [
                new Sprite({
                    position: {
                        x: 767,
                        y: 272,
                    },
                    imageSrc: 'doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                }),
            ]

        }

    }
}


let collisionBlocks = []
let parsedCollision = collisionLevel1.parse2D()
parsedCollision.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 292) {

            collisionBlocks.push(new CollisionBlock({
                position: {
                    x: x * 64,
                    y: y * 64,
                },
            }))
        }
    })

})
let backgroundlevel1 = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: 'backgroundLevel1.png'
})
let doors = [
    new Sprite({
        position: {
            x: 767,
            y: 272,
        },
        imageSrc: 'doorOpen.png',
        frameRate: 5,
        frameBuffer: 5,
        loop: false,
        autoplay: false,
    }),
]


const player = new Player({
    collisionBlocks,
    imageSrc: 'idle.png',
    frameRate: 11,
    animation: {
        idleRight: {
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
            imageSrc: 'idle.png',
        },
        idleLeft: {
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
            imageSrc: 'idleLeft.png',
        },
        runRight: {
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
            imageSrc: 'runRight.png',
        },
        runLeft: {
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
            imageSrc: 'runLeft.png',
            // image: new Image()
        },
        enterDoor: {
            frameRate: 8,
            frameBuffer: 4,
            loop: false,
            imageSrc: 'enterDoor.png',
            onComplete: () => {
                console.log('completed animation')
                // overlay.opacity 0 1 
                gsap.to(overlay, {
                    opacity: 1,
                    onComplete: () => {
                        level++
                        levels[level].init()
                        gsap.to(overlay, {
                            opacity: 0,
                        })

                    }
                })
            },
        },
    },
})


const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
}

const overlay = {
    opacity: 0,
}

function animate() {

    window.requestAnimationFrame(animate)
    // console.log('go') 
    // c.fillStyle = 'white'
    // c.fillRect(0, 0, canvas.width, canvas.height)


    backgroundlevel1.draw()
    collisionBlocks.forEach(collisionBlock => {
        collisionBlock.draw()
    })
    doors.forEach(door => {
        door.draw()
    })

    player.handleInput(keys)
    player.draw()
    player.update()

    c.save()
    c.globalAlpha = overlay.opacity
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    c.restore()


}
levels[level].init()
animate()






