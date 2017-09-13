var game = new Phaser.Game(1000, 600, Phaser.AUTO, "game_container");


function GameState() {
    this.john;
    this.zombies;
    this.walls;
    this.bullets;
    this.cursors;
    this.spaceBar;
    this.shootAudio;
    this.scoreText;
    this.score = 0;
    this.lastPressedButton = "down"; // expects up, down, left, right
    this.keySpriteMap = {
        up: 4,
        right: 8,
        down: 0,
        left: 15
    };
    this.lastBulletTime = 0; // in milliseconds
    this.lastZombieTime = 0; // in milliseconds
    this.audioDecoded = false;
};

function StageOne(){
    GameState.call(this);

    this.preload = function () {

        game.load.image("ground", "assets/sprites/ground_stage_01.png");
        game.load.spritesheet("ss_john", "assets/sprites/spritesheet_john_complete.png", 20, 70);
        game.load.spritesheet("ss_zombie", "assets/sprites/spritesheet_zombie_complete.png", 20, 70);
        game.load.image("bullet", "assets/sprites/bullet.png");
        game.load.image("dot", "assets/sprites/white_dot.png");
        game.load.image("black_screen", "assets/sprites/black_screen.png");
        game.load.audio("shoot", ["assets/audio/shoot.mp3","assets/audio/shoot.ogg"]);
    };

    this.create = function () {
        // setting game physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.createSprites();

        this.shootAudio = game.add.audio("shoot");

        // Comment took from: https://phaser.io/examples/v2/audio/sound-complete
        // Being mp3 files these take time to decode, so we can't play them instantly
        // Using setDecodedCallback we can be notified when they're ALL ready for use.
        // The audio files could decode in ANY order, we can never be sure which it'll be.
        game.sound.setDecodedCallback([this.shootAudio], this.setAudioDecoded, this);

        this.cursors = game.input.keyboard.createCursorKeys();
        this.spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.john.frame = 0;

        this.scoreText = game.add.text(20, 560, "Score: ", {font: "15px Arial", fill: "#ffffff"});

    };

    this.update = function () {
        // checks collisions betwenn john and wall, and between zombies and walls
        game.physics.arcade.collide(this.john, this.walls);
        game.physics.arcade.collide(this.zombies, this.walls);
        game.physics.arcade.collide(this.zombies, this.zombies);
        // checks overlaps between john and zombies, and between bullets and zombies
        game.physics.arcade.overlap(this.john, this.zombies, this.gameOver, null, this); // in case of overlap, ends the game
        game.physics.arcade.overlap(this.bullets, this.zombies, this.killZombie, null, this); // in case of overlap, kills the zombie hit
        game.physics.arcade.overlap(this.bullets, this.walls, this.removeBullet, null, this);

        this.updatePlayer();
        this.updateBullets();
        this.updateZombies();

        this.scoreText.setText("Score: " + this.score);
    };

    this.createSprites = function (){
        game.add.sprite(0, 0, "ground"); // craeting the ground
        
        this.walls = game.add.group(); // sprite group to group all the walls in the game
        this.walls.enableBody = true; // enables physics for all group members
        this.createWalls(this.walls)

        this.john = game.add.sprite(50, 0, "ss_john");
        game.physics.arcade.enable(this.john);    
        this.john.body.collideWorldBounds = true;

        this.john.animations.add("up", [4, 5 ,6 , 7], 10, true);
        this.john.animations.add("down", [0, 1, 2, 3], 10, true);
        this.john.animations.add("left", [15, 14, 13, 12], 10, true);
        this.john.animations.add("right", [8, 9, 10, 11], 10, true);
        
        this.bullets = game.add.group();
        // https://phaser.io/examples/v2/input/keyboard-justpressed
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(20, "bullet");
        this.bullets.callAll("events.onOutOfBounds.add", "events.onOutOfBounds", this.removeBullet, this);
        this.bullets.setAll("checkWorldBounds", true);

        this.zombies = game.add.group();
        this.zombies.enableBody = true;
        this.zombies.physicsBodyType = Phaser.Physics.ARCADE;
        this.zombies.createMultiple(30, "ss_zombie");
        this.zombies.setAll("body.collideWorldBounds", true);
        this.zombies.callAll("animations.add", "animations", "up", [4, 5 ,6 , 7], 10, true);
        this.zombies.callAll("animations.add", "animations", "down", [0, 1, 2, 3], 10, true);
        this.zombies.callAll("animations.add", "animations", "left", [15, 14, 13, 12], 10, true);
        this.zombies.callAll("animations.add", "animations", "right", [8, 9, 10, 11], 10, true);
    };

    this.createWalls = function (walls){
        this.createWall(walls, "dot", 160, 0, 20, 300);
        this.createWall(walls, "dot", 160, 400, 20, 200);
        this.createWall(walls, "dot", 180, 0, 340, 55);
        this.createWall(walls, "dot", 800, 0, 200, 175);
        this.createWall(walls, "dot", 320, 440, 320, 160);
        this.createWall(walls, "dot", 680, 560, 320, 40);
    };

    this.createWall = function (wallGroup, spriteId, x, y, width, height){
        var wall = wallGroup.create(x, y, spriteId);
        wall.body.immovable = true;
        wall.scale.x = width;
        wall.scale.y = height;  
        wall.tint = 0xff0000;
        wall.visible = false; 
    };

    this.updatePlayer = function (){
        //  Reset the player velocity (movement)
        this.john.body.velocity.x = 0;
        this.john.body.velocity.y = 0;

        if (this.cursors.left.isDown){
            this.lastPressedButton = "left";
            this.john.body.velocity.x = -200; // moves left
            this.john.animations.play("left");
        } else if (this.cursors.right.isDown){
            this.lastPressedButton = "right";
            this.john.body.velocity.x = 200; // moves down
            this.john.animations.play("right");
        } else if (this.cursors.up.isDown){
            this.lastPressedButton = "up";
            this.john.body.velocity.y = -200; // moves down
            this.john.animations.play("up");
        } else if (this.cursors.down.isDown){
            this.lastPressedButton = "down";
            this.john.body.velocity.y = 200; // moves down
            this.john.animations.play("down");
        } else {
            this.john.animations.stop();
            this.john.frame = this.keySpriteMap[this.lastPressedButton];
        }   
    };

    this.updateBullets = function (){
        if (this.spaceBar.isDown && this.audioDecoded){
            var currentTime = (new Date()).getTime();
            if ((currentTime - this.lastBulletTime) >= 500){
                this.shoot();
                this.lastBulletTime = currentTime;
            }  
            
        }
    };

    this.updateZombies = function (){
        var currentTime = (new Date()).getTime();
        // checks if it should create a new zombie or not
        if (((currentTime - this.lastZombieTime) >= 1000) && (this.getRandomInt(2) == 1)){
            // creates a zombie if the number of zombies is <= the number set in zombies.createMultiple
            var zombie = this.zombies.getFirstExists(false);
            if (zombie){
                // chooses the spawn point randomly
                var spawnPoint = this.getZombieSpawnPoint(this.getRandomInt(3)); // 3 possible places
                zombie.reset(spawnPoint.x, spawnPoint.y);

                this.lastZombieTime = currentTime;
            }
        } 

        this.zombies.forEach(function(zombie){
            if (!("lastActionTime" in zombie)){ // checks if zombie already has the lastActionTime property
                zombie.lastActionTime = 0;
            }

            var currentTime = (new Date()).getTime();

            if (((currentTime - zombie.lastActionTime) >= 2000)){
                // decide action
                var zombieAction = this.getZombieAction(this.getRandomInt(5));
                // action
                zombie.body.velocity.x = zombieAction.x;
                zombie.body.velocity.y = zombieAction.y;
                zombie.animations.play(zombieAction.animation);
                zombie.lastActionTime = currentTime;
            }
        }.bind(this));
    };

    this.getZombieSpawnPoint = function (locationNumber){
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
    };

    this.getZombieAction = function (actionNumber){
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
    };

    this.gameOver = function (john, zombie){
        game.paused = true;
        game.add.sprite(0, 0, "black_screen");
        var finalResultsText = game.add.text(game.world.centerX, game.world.centerY,
            "Game Over\n\nYour final score is:\n" + this.score + "\n\nPress SPACE to try again", 
            {
                font: "60px Arial", 
                fill: "#ffffff",
                align: "center"
            });
        finalResultsText.anchor.setTo(0.5, 0.5);
        this.spaceBar.onDown.add(this.restartGame, this);
    };
     
    this.restartGame = function (){
        game.paused = false;
        //gameState = new GameState();
        game.state.restart();
    };

    this.killZombie = function  (bullet, zombie) {
        zombie.kill(); // removes the sprite
        this.removeBullet(bullet);
        this.score = this.score + 10; // increases score
    };

    this.shoot = function (){
        var bullet = this.bullets.getFirstExists(false);
        if (bullet){
            bullet.reset(this.john.x + 10, this.john.y + 25); // aproximatelly from the middle of the main character"s chest
            this.setBulletBodyVelocity(bullet, this.lastPressedButton)
            this.shootAudio.play();
        }
        //var bullet = bullets.create(john.x + 10, john.y + 25, "bullet"); 
    };

    this.setBulletBodyVelocity = function (bullet, characterOrientation){
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
    };

    this.removeBullet = function (bullet){
        bullet.kill();
    };

    // n defines the interval of possible results, being it like [0, n)
    this.getRandomInt = function (n){
        return Math.floor(Math.random() * 10) % n
    };

    this.setAudioDecoded = function (){
        this.audioDecoded = true;
    };
}

stageOne = new StageOne();
game.state.add("StageOne", stageOne);
game.state.start("StageOne");
