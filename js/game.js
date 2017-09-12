var game = new Phaser.Game(1000, 600, Phaser.AUTO, "game_container", { preload: preload, create: create, update: update });

function preload() {

    game.load.image("ground", "assets/sprites/ground_stage_01.png");
    game.load.spritesheet("ss_john", "assets/sprites/spritesheet_john_complete.png", 20, 70);
    game.load.spritesheet("ss_zombie", "assets/sprites/spritesheet_zombie_complete.png", 20, 70);
    game.load.image("bullet", "assets/sprites/bullet.png");
    game.load.image("dot", "assets/sprites/white_dot.png");
    game.load.image("black_screen", "assets/sprites/black_screen.png");

    game.load.audio("shoot", ["assets/audio/shoot.mp3","assets/audio/shoot.ogg"]);

}

var john;
var zombies;
var walls;
var bullets;
var cursors;
var spaceBar;
var shootAudio;
var scoreText;
var gameState = new GameState();

function GameState() {
    this.score = 0;
    this.lastPressedButton = "down"; // expects up, down, left, right
    this.keySpriteMap = {
        up: 4,
        right: 8,
        down: 0,
        left: 15
    };
    this.horizontallyFlipped = false;
    this.lastBulletTime = 0; // in milliseconds
    this.lastZombieTime = 0; // in milliseconds
    this.audioDecoded = false;
};

function createSprites(){
    game.add.sprite(0, 0, "ground"); // craeting the ground
    
    walls = game.add.group(); // sprite group to group all the walls in the game
    walls.enableBody = true; // enables physics for all group members
    createWalls(walls)

    john = game.add.sprite(50, 0, "ss_john");
    game.physics.arcade.enable(john);    
    john.body.collideWorldBounds = true;

    john.animations.add("up", [4, 5 ,6 , 7], 10, true);
    john.animations.add("down", [0, 1, 2, 3], 10, true);
    john.animations.add("left", [15, 14, 13, 12], 10, true);
    john.animations.add("right", [8, 9, 10, 11], 10, true);
    
    bullets = game.add.group();
    // https://phaser.io/examples/v2/input/keyboard-justpressed
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(20, "bullet");
    bullets.callAll("events.onOutOfBounds.add", "events.onOutOfBounds", removeBullet, this);
    bullets.setAll("checkWorldBounds", true);

    zombies = game.add.group();
    zombies.enableBody = true;
    zombies.physicsBodyType = Phaser.Physics.ARCADE;
    zombies.createMultiple(30, "ss_zombie");
    zombies.setAll("body.collideWorldBounds", true);
    zombies.callAll("animations.add", "animations", "up", [4, 5 ,6 , 7], 10, true);
    zombies.callAll("animations.add", "animations", "down", [0, 1, 2, 3], 10, true);
    zombies.callAll("animations.add", "animations", "left", [15, 14, 13, 12], 10, true);
    zombies.callAll("animations.add", "animations", "right", [8, 9, 10, 11], 10, true);
    //zombies.callAll("events.onOutOfBounds.add", "events.onOutOfBounds", killZombie, this);
    //zombies.setAll("checkWorldBounds", true);

}

function createWalls(walls){
    createWall(walls, "dot", 160, 0, 20, 300);
    createWall(walls, "dot", 160, 400, 20, 200);
    createWall(walls, "dot", 180, 0, 340, 55);
    createWall(walls, "dot", 800, 0, 200, 175);
    createWall(walls, "dot", 320, 440, 320, 160);
    createWall(walls, "dot", 680, 560, 320, 40);
}

function createWall(wallGroup, spriteId, x, y, width, height){
    var wall = wallGroup.create(x, y, spriteId);
    wall.body.immovable = true;
    wall.scale.x = width;
    wall.scale.y = height;    
    wall.tint = 0xff0000;
}

function create() {
    // setting game physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    createSprites();

    shootAudio = game.add.audio("shoot");

    // Comment took from: https://phaser.io/examples/v2/audio/sound-complete
    // Being mp3 files these take time to decode, so we can't play them instantly
    // Using setDecodedCallback we can be notified when they're ALL ready for use.
    // The audio files could decode in ANY order, we can never be sure which it'll be.
    game.sound.setDecodedCallback([shootAudio], setAudioDecoded, this);

    cursors = game.input.keyboard.createCursorKeys();
    spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    john.frame = 0;

    scoreText = game.add.text(20, 560, "Score: ", {font: "15px Arial", fill: "#ffffff"});

}

function update() {
    // checks collisions betwenn john and wall, and between zombies and walls
    game.physics.arcade.collide(john, walls);
    game.physics.arcade.collide(zombies, walls);
    game.physics.arcade.collide(zombies, zombies);
    // checks overlaps between john and zombies, and between bullets and zombies
    game.physics.arcade.overlap(john, zombies, gameOver, null, this); // in case of overlap, ends the game
    game.physics.arcade.overlap(bullets, zombies, killZombie, null, this); // in case of overlap, kills the zombie hit
    game.physics.arcade.overlap(bullets, walls, removeBullet, null, this);

    updatePlayer();
    updateBullets();
    updateZombies();

    scoreText.setText("Score: " + gameState.score);
}

function updatePlayer(){
    //  Reset the player velocity (movement)
    john.body.velocity.x = 0;
    john.body.velocity.y = 0;

    if (cursors.left.isDown){
        gameState.lastPressedButton = "left";
        john.body.velocity.x = -200; // moves left
        john.animations.play("left");
    } else if (cursors.right.isDown){
        gameState.lastPressedButton = "right";
        john.body.velocity.x = 200; // moves down
        john.animations.play("right");
    } else if (cursors.up.isDown){
        gameState.lastPressedButton = "up";
        john.body.velocity.y = -200; // moves down
        john.animations.play("up");
    } else if (cursors.down.isDown){
        gameState.lastPressedButton = "down";
        john.body.velocity.y = 200; // moves down
        john.animations.play("down");
    } else {
        john.animations.stop();
        john.frame = gameState.keySpriteMap[gameState.lastPressedButton];
    }   
}

function updateBullets(){
    if (spaceBar.isDown && gameState.audioDecoded){
        var currentTime = (new Date()).getTime();
        if ((currentTime - gameState.lastBulletTime) >= 500){
            shoot();
            gameState.lastBulletTime = currentTime;
        }  
        
    }
}

function updateZombies(){
    var currentTime = (new Date()).getTime();
    // checks if it should create a new zombie or not
    if (((currentTime - gameState.lastZombieTime) >= 1000) && (getRandomInt(2) == 1)){
        // creates a zombie if the number of zombies is <= the number set in zombies.createMultiple
        var zombie = zombies.getFirstExists(false);
        if (zombie){
            // chooses the spawn point randomly
            var spawnPoint = getZombieSpawnPoint(getRandomInt(3)); // 3 possible places
            zombie.reset(spawnPoint.x, spawnPoint.y);

            gameState.lastZombieTime = currentTime;
        }
    } 

    zombies.forEach(function(zombie){
        if (!("lastActionTime" in zombie)){ // checks if zombie already has the lastActionTime property
            zombie.lastActionTime = 0;
        }

        var currentTime = (new Date()).getTime();

        if (((currentTime - zombie.lastActionTime) >= 2000)){
            // decide action
            var zombieAction = getZombieAction(getRandomInt(5));
            // action
            zombie.body.velocity.x = zombieAction.x;
            zombie.body.velocity.y = zombieAction.y;
            zombie.animations.play(zombieAction.animation);
            zombie.lastActionTime = currentTime;
        }
    });
    


}

function getZombieSpawnPoint(locationNumber){
    var locationCoordinates = {};
    switch(locationNumber){
        case 0:
            locationCoordinates.x = 620;
            locationCoordinates.y = 0;
            break;
        case 1:
            locationCoordinates.x = 200;
            locationCoordinates.y = 530;
            break;
        case 2:
            locationCoordinates.x = 980;
            locationCoordinates.y = 430;
            break;
    }

    return locationCoordinates;
}

function getZombieAction(actionNumber){
    var bodySpeed = {};
    switch(actionNumber){
        case 0:
            // walk up
            bodySpeed.x = 0;
            bodySpeed.y = -100;
            bodySpeed.animation = "up";
            break;
        case 1:
            // walk right
            bodySpeed.x = 100;
            bodySpeed.y = 0;
            bodySpeed.animation = "right";
            break;
        case 2:
            // walk down
            bodySpeed.x = 0;
            bodySpeed.y = 100;
            bodySpeed.animation = "down";
            break;
        case 3:
            // walk left
            bodySpeed.x = -100;
            bodySpeed.y = 0;
            bodySpeed.animation = "left";
            break;
        case 4:
            // stand still
            bodySpeed.x = 0;
            bodySpeed.y = 0;
            break;
    }
    return bodySpeed;
}

function gameOver(john, zombie){
    game.paused = true;
    game.add.sprite(0, 0, "black_screen");
    var finalResultsText = game.add.text(game.world.centerX, game.world.centerY,
        "Game Over\n\nYour final score is:\n" + gameState.score + "\n\nPress SPACE to try again", 
        {
            font: "60px Arial", 
            fill: "#ffffff",
            align: "center"
        });
    finalResultsText.anchor.setTo(0.5, 0.5);
    spaceBar.onDown.add(restartGame, this);
}
 
function restartGame(){
    game.paused = false;
    gameState = new GameState();
    game.state.restart();
}

function killZombie (bullet, zombie) {
    zombie.kill(); // removes the sprite
    removeBullet(bullet);
    gameState.score = gameState.score + 10; // increases score
}

function shoot(){
    var bullet = bullets.getFirstExists(false);
    if (bullet){
        bullet.reset(john.x + 10, john.y + 25); // aproximatelly from the middle of the main character"s chest
        setBulletBodyVelocity(bullet, gameState.lastPressedButton)
        shootAudio.play();
    }
    //var bullet = bullets.create(john.x + 10, john.y + 25, "bullet"); 
}

function setBulletBodyVelocity(bullet, characterOrientation){
    bullet.body.velocity.x = 0;
    bullet.body.velocity.y = 0;

    switch (characterOrientation){
        case "up":
            bullet.body.velocity.y = -500;
            break;
        case "right":
            bullet.body.velocity.x = 500;
            break;
        case "down":
            bullet.body.velocity.y = 500;
            break;
        case "left":
            bullet.body.velocity.x = -500;
            break;
    }
}

function removeBullet(bullet){
    bullet.kill();
}

// n defines the interval of possible results, being it like [0, n)
function getRandomInt(n){
    return Math.floor(Math.random() * 10) % n
}

function setAudioDecoded(){
    gameState.audioDecoded = true;
}
