var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'game_container', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('ground', 'assets/sprites/ground_stage_01.png');
    game.load.spritesheet('ss_john', 'assets/sprites/spritesheet_john_complete.png', 20, 70);
    game.load.spritesheet('ss_zombie', 'assets/sprites/spritesheet_zombie_complete.png', 20, 70);
    //game.load.image('bullet', 'assets/sprites/bullet.png');
    game.load.image('dot', 'assets/sprites/white_dot.png');

}

var john;
var zombies;
var walls;
var bullets;
var gameState = new function () {
    this.score = 0;
    this.lastPressedButton = "down"; // expects up, down, left, right
    this.keySpriteMap = {
        up: 4,
        right: 8,
        down: 0,
        left: 15
    };
    this.horizontallyFlipped = false;
};


function createSprites(){
    game.add.sprite(0, 0, "ground"); // craeting the ground

    
    walls = game.add.group(); // sprite group to group all the walls in the game
    walls.enableBody = true; // enables physics for all group members
    createWalls(walls)

    john = game.add.sprite(50, 0, 'ss_john');
    game.physics.arcade.enable(john);    
    john.body.collideWorldBounds = true;

    john.animations.add('up', [4, 5 ,6 , 7], 10, true);
    john.animations.add('down', [0, 1, 2, 3], 10, true);
    john.animations.add('left', [15, 14, 13, 12], 10, true);
    john.animations.add('right', [8, 9, 10, 11], 10, true);

    zombies = game.add.group();
    
    bullets = game.add.group();

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

    cursors = game.input.keyboard.createCursorKeys();

    john.frame = 0;

}

function update() {
    // checks collisions betwenn john and wall, and between zombies and walls
    game.physics.arcade.collide(john, walls);
    game.physics.arcade.collide(zombies, walls);
    // checks overlaps between john and zombies, and between bullets and zombies
    game.physics.arcade.overlap(john, zombies, gameOver, null, this); // in case of overlap, ends the game
    game.physics.arcade.overlap(bullets, zombies, killZombie, null, this); // in case of overlap, kills the zombie hit

    updatePlayer();

}

function updatePlayer(){
    //  Reset the player velocity (movement)
    john.body.velocity.x = 0;
    john.body.velocity.y = 0;

    if (cursors.left.isDown){
        gameState.lastPressedButton = "left";
        john.body.velocity.x = -200; // moves left
        john.animations.play('left');
    } else if (cursors.right.isDown){
        gameState.lastPressedButton = "right";
        john.body.velocity.x = 200; // moves down
        john.animations.play('right');
    } else if (cursors.up.isDown){
        gameState.lastPressedButton = "up";
        john.body.velocity.y = -200; // moves down
        john.animations.play('up');
    } else if (cursors.down.isDown){
        gameState.lastPressedButton = "down";
        john.body.velocity.y = 200; // moves down
        john.animations.play('down');
    } else {
        john.animations.stop();
        john.frame = gameState.keySpriteMap[gameState.lastPressedButton];
    }
}

function gameOver(john, zombie){

}

function killZombie (bullet, zombie) {
    zombie.kill(); // removes the sprite
}

