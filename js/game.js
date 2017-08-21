var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'game_container', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('ground', 'assets/sprites/ground_stage_01.png');
    game.load.spritesheet('ss_john', 'assets/sprites/spritesheet_john.png', 20, 70);
    game.load.spritesheet('ss_zombie', 'assets/sprites/spritesheet_zombie.png', 20, 70);
    game.load.image('bullet', 'assets/sprites/bullet.png');
    game.load.image('dot', 'assets/sprites/white_dot.png');

}

var player;
var zombies;
var walls;
var bullets;


function createSprites(){
    game.add.sprite(0, 0, "ground"); // craeting the ground

    
    walls = game.add.group(); // groups all the walls in the game
    walls.enableBody = true; // enables physics for all group members

    var wallBlock = walls.create(160, 0, "dot");
    wallBlock.body.immovable = true;
    wallBlock.scale.x = 20;
    wallBlock.scale.y = 300;    
    wallBlock.tint = 0xff0000;

    wallBlock = walls.create(160, 400, "dot");
    wallBlock.body.immovable = true;
    wallBlock.scale.x = 20;
    wallBlock.scale.y = 200;    
    wallBlock.tint = 0xff0000;

    wallBlock = walls.create(180, 0, "dot");
    wallBlock.body.immovable = true;
    wallBlock.scale.x = 340;
    wallBlock.scale.y = 55;    
    wallBlock.tint = 0xff0000;

    wallBlock = walls.create(800, 0, "dot");
    wallBlock.body.immovable = true;
    wallBlock.scale.x = 200;
    wallBlock.scale.y = 175;    
    wallBlock.tint = 0xff0000;

    wallBlock = walls.create(320, 440, "dot");
    wallBlock.body.immovable = true;
    wallBlock.scale.x = 320;
    wallBlock.scale.y = 160;    
    wallBlock.tint = 0xff0000;

    wallBlock = walls.create(680, 560, "dot");
    wallBlock.body.immovable = true;
    wallBlock.scale.x = 320;
    wallBlock.scale.y = 40;    
    wallBlock.tint = 0xff0000;



}

function create() {
    // setting game physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    createSprites();





    /*
    

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    */
    
}

function update() {

    /*

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }

    */

}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}

