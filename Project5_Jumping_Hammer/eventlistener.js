//****************************************************EventListerner.js(Open)*****************************************
window.addEventListener('keydown', (event) => {
    // console.log(event)
    if(player.preventInput) return
    switch (event.key) {
        case 'w':
            for(let i = 0 ; i< doors.length; i++){
                const door = doors[i]

                if(player.hitBox.position.x + player.hitBox.width <= door.position.x + door.width &&
                    player.hitBox.position.x  >= door.position.x &&
                    player.hitBox.position.y + player.hitBox.height >= door.position.y &&
                    player.hitBox.position.y <= door.position.y + door.height){
                        // console.log('we are colliding')
                        player.velocity.x = 0
                        player.velocity.y = 0
                        
                        player.preventInput = true
                        player.switchSprite('enterDoor')
                        door.play()
                        return

                    }
            }
            if (player.velocity.y == 0)
                player.velocity.y = -25

            break
        case 'a':
            // player.velocity.x = -4
            //make player to move left
            keys.a.pressed = true

            break
        case 'd':
            // player.velocity.x = 4
            keys.d.pressed = true

            //make player to move right
            break
    }

})


window.addEventListener('keyup', (event) => {
    console.log(event)
    switch (event.key) {
        case 'a':
            // player.velocity.x = 0
            //make player to move left
            keys.a.pressed = false
            break
        case 'd':
            //player.velocity.x = 0
            //make player to move right
            keys.d.pressed = false
            break
    }

})
//****************************************************EventListerner.js(Close)*****************************************
