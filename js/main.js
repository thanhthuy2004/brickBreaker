const cvs = document.getElementById("breakout");
const ctx = cvs.getContext("2d");

// ctx.lineWidth = 3;

const WOOD_WIDTH = 100;
const WOOD_MARGIN_BOTTOM = 20;
const WOOD_HEIGHT = 20;

const BALL_RADIUS = 7;

let LIFE = 3;
let score = 0;
let score_unit = 10;
let levelOption = 0;
let LEVEL = 1;
const MAX_LEVEL = 2;
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;


const wood_Img = new Image();
const wood_Img_vertical = new Image();
const background = new Image();
wood_Img.src = "img/paddle.jpg";
wood_Img_vertical.src = "img/paddleOrther.jpg";
background.src ="img/br.jpg";

// SOUND
const WALL_HIT = new Audio();
WALL_HIT.src = "sounds/wall.mp3";

const LIFE_LOST = new Audio();
LIFE_LOST.src = "sounds/life_lost.mp3";

const PADDLE_HIT = new Audio();
PADDLE_HIT.src = "sounds/paddle_hit.mp3";

const WIN = new Audio();
WIN.src = "sounds/win.mp3";

const BRICK_HIT = new Audio();
BRICK_HIT.src = "sounds/brick_hit.mp3";

function setBr() { // set background
    ctx.drawImage(background, 0,0);
}

const wood = { // create wood
    x: cvs.width / 2 - WOOD_WIDTH / 2,
    y: cvs.height - WOOD_MARGIN_BOTTOM - WOOD_HEIGHT,
    width: WOOD_WIDTH,
    height: WOOD_HEIGHT,
    // dx: 5
    dx:10
}

function drawWood() { // draw wood
    ctx.drawImage(wood_Img, wood.x, wood.y, wood.width, wood.height);

}

document.addEventListener("keydown", function (event) { // method for key down
    if (event.key == 'ArrowLeft') {
        leftArrow = true;
    } else if (event.key == 'ArrowRight') {
        rightArrow = true;
    }
})
document.addEventListener("keyup", function (event) { // method for key up
    if (event.key == 'ArrowLeft') {
        leftArrow = false;
    } else if (event.key == 'ArrowRight') {
        rightArrow = false;
    }
})
function moveWood() { // move wood
    if (rightArrow && wood.x + wood.width < cvs.width) {
        wood.x += wood.dx;
    } else if (leftArrow && wood.x > 0) {
        wood.x -= wood.dx;
    }
}

const ball = {  // create ball
    x: cvs.width / 2,
    y: wood.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 5,
    dx: 4 * (Math.random() * 2 - 1),
    dy: -4
}

function drawBall() { //draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#ff605c";
    ctx.fill();

    ctx.strokeStyle = "#E9F8F9";
    ctx.stroke();
    ctx.closePath();

}

function moveBall() { // move ball
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function resetBall() { // reset ball
    ball.x = cvs.width / 2;
    ball.y = wood.y - BALL_RADIUS;
    ball.dx = 4 * (Math.random() * 2 - 1);
    ball.dy = -4;
}

function ballWallColl() { // ball and wall Collision
    if(ball.x + ball.radius > cvs.width ){
        if(ball.dx > 0){
            ball.dx = - ball.dx;
        }
        
        WALL_HIT.play();
       
    }
    if(ball.x - ball.radius < 0){
        if(ball.dx < 0){
            ball.dx = - ball.dx;
        }
        WALL_HIT.play();
    }
    
    if(ball.y - ball.radius < 0){
        ball.dy = -ball.dy;
        WALL_HIT.play();
    }
    
    if(ball.y + ball.radius > cvs.height){
        LIFE--; // LOSE LIFE
        LIFE_LOST.play();
        resetBall();
    }

}

function ballWoodColl() { // ball and wood Collision
    if (ball.x - ball.radius < wood.x + wood.width &&
        ball.x + ball.radius > wood.x &&
        ball.y - ball.radius < wood.y + wood.height &&
        ball.y + ball.radius > wood.y) {
        PADDLE_HIT.play();

        let collidePoint = ball.x - (wood.x + wood.width / 2);
        collidePoint = collidePoint / (wood.width / 2);
        
        let angle = collidePoint * Math.PI / 3;
       
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
    }

}

const brick = { // create brick
    row: 3,
    col: 5,
    width: 100,
    height: 20,
    borderLeft: 15,
    borderTop: 20,
    marginTop: 10,
    fillColor: "#C0EEF2",
    strokeColor: "#537FE7",
}
let bricks = [];

function createBricks() { // create bricks
    for (let r = 0; r < brick.row; r++) {
        bricks[r] = [];
        for (let c = 0; c < brick.col; c++) {
            bricks[r][c] = {
                x: c * (brick.borderLeft + brick.width) + brick.borderLeft,
                y: r * (brick.borderTop + brick.height) + brick.borderTop + brick.marginTop,
                status: true
            }
        }
    }
}

createBricks();


function drawBricks() { // draw bricks
    for (let r = 0; r < brick.row; r++) {

        for (let c = 0; c < brick.col; c++) {
            let b = bricks[r][c];
            if (b.status) {
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);
                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

function ballBrickColl() { // if ball and brick collision, score += 10
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.col; c++) {
            let b = bricks[r][c];
            if (b.status) {
                if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width &&
                    ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height) {
                    BRICK_HIT.play();
                    ball.dy = -ball.dy;
                    b.status = false;
                    score += score_unit;
                }
            }
        }
    }
}

const barricade = { // create barricade
    x: 0,
    y: 150,
    width: 150,
    height: 30,
}
const barricadeDynamics = { // create barricadeDynamics
    x: 225,
    y: 150,
    width: 150,
    height: 30,
    dx: 2
}
const barricadeVertical = { // create barricadeVertical
    x: 150,
    y: 150,
    width: 30,
    height: 100,
    dy: 2

}

function drawBarricade() { // draw barricade, level two wood
    ctx.drawImage(wood_Img, barricade.x, barricade.y, barricade.width, barricade.height);
    ctx.drawImage(wood_Img, barricade.x+ cvs.width - barricade.width, barricade.y, barricade.width, barricade.height);
}
function drawBarricadeMatrix() { // draw barricade, level three wood 
    ctx.drawImage(wood_Img, barricade.x, barricade.y+20, barricade.width, barricade.height);
    ctx.drawImage(wood_Img, barricade.x+ cvs.width - barricade.width-50, barricade.y+100, barricade.width+50, barricade.height);
    ctx.drawImage(wood_Img, barricade.x, barricade.y+200, barricade.width+40, barricade.height);
}
function drawBarricadeDynamic() { // draw Barricade Dynamic, level Wall Dynamic Horizontal
    ctx.drawImage(wood_Img, barricadeDynamics.x, barricadeDynamics.y, barricadeDynamics.width, barricadeDynamics.height);
}
function drawBarricadeVertical() { // draw Barricade Vertical, level Wall Dynamic Vertical
    ctx.drawImage(wood_Img_vertical, barricadeVertical.x, barricadeVertical.y, barricadeVertical.width, barricadeVertical.height);
    ctx.drawImage(wood_Img_vertical, barricadeVertical.x + 280, barricadeVertical.y, barricadeVertical.width, barricadeVertical.height);
}


function ballBarricadeColl(dx, dy, w, h) { // check touch between ball and Barricade
    if (ball.x + ball.radius > barricade.x + dx && ball.x - ball.radius < barricade.x + dx + barricade.width +w &&
        ball.y + ball.radius > barricade.y + dy && ball.y - ball.radius < barricade.y + dy + barricade.height +h) {
        BRICK_HIT.play();
        let collidePoint = ball.x - ((barricade.x+dx) + (barricade.width+w) / 2);
        collidePoint = collidePoint / ((barricade.width+w) / 2);
        
        let angle = collidePoint * Math.PI / 3;
       
        ball.dx = ball.speed * Math.sin(angle);
       
        if(ball.dy > 0 && ball.y < (barricade.y+dy)){ // top
            ball.dy = -ball.speed * Math.cos(angle);

        }
        else if(ball.dy < 0 && ball.y > barricade.y + dy + barricade.height + h){ // bottom
        ball.dy = ball.speed * Math.cos(angle);
        }
    }
}
function moveBarricadeDynamics(){ // move Barricade Dynamics
    if(barricadeDynamics.x > cvs.width-barricadeDynamics.width || barricadeDynamics.x < 0){
        barricadeDynamics.dx = -barricadeDynamics.dx;
    }
    barricadeDynamics.x += barricadeDynamics.dx;
}
function ballBarricadeDynamicsColl() { // check touch between ball and Barricade Dynamics
    if (ball.x + ball.radius > barricadeDynamics.x && ball.x - ball.radius < barricadeDynamics.x + barricadeDynamics.width &&
        ball.y + ball.radius > barricadeDynamics.y && ball.y - ball.radius < barricadeDynamics.y + barricadeDynamics.height) {
       
        BRICK_HIT.play();
        
        let collidePoint = ball.x - (barricadeDynamics.x + barricadeDynamics.width / 2);
        collidePoint = collidePoint / (barricadeDynamics.width / 2);
        
        let angle = collidePoint * Math.PI / 3;
       
        ball.dx = ball.speed * Math.sin(angle);
       
        if(ball.dy > 0 && ball.y < barricadeDynamics.y){ // top
            ball.dy = -ball.speed * Math.cos(angle);

        }
        else if(ball.dy < 0 && ball.y > barricadeDynamics.y+ barricadeDynamics.height){ // bottom
        ball.dy = ball.speed * Math.cos(angle);
        }

    }
}
function moveBarricadeVertical(){ // move Barricade Vertical
    if(barricadeVertical.y + barricadeVertical.height > wood.y || barricadeVertical.y  < 150){
        barricadeVertical.dy = -barricadeVertical.dy;
    }
    barricadeVertical.y += barricadeVertical.dy;
}
function ballBarricadeVerticalColl(dx, dy) { // check touch between ball and Barricade Vertical
    if (ball.x + ball.radius > barricadeVertical.x + dx &&
        ball.x - ball.radius < barricadeVertical.x + dx + barricadeVertical.width &&
        ball.y + ball.radius > barricadeVertical.y + dy &&
        ball.y - ball.radius < barricadeVertical.y + dy + barricadeVertical.height) {

        BRICK_HIT.play();

        let collidePoint = ball.x - ((barricadeVertical.x+dx) + (barricadeVertical.width) / 2);
        collidePoint = collidePoint / ((barricadeVertical.width) / 2);

        let angle = collidePoint * Math.PI / 3;

        ball.dx = ball.speed * Math.sin(angle);

        if(ball.dy > 0 && ball.y < (barricadeVertical.y+dy)){ // top
            ball.dy = -ball.speed * Math.cos(angle);
        }
        else if(ball.dy < 0 && ball.y > (barricadeVertical.y+dy)+ (barricadeVertical.height)){ // bottom
            ball.dy = ball.speed * Math.cos(angle);
        }

    }
}

const spiky = { // create spiky
    x: 0,
    y: 200,
    width: 50,
    height: 100,
    fillColor: "#FF0032",
    strokeColor: "#181823",
    dy:2
}

function drawSpiky() { // draw Spiky, level reset ball
    ctx.fillStyle = spiky.fillColor;
    ctx.fillRect(spiky.x, spiky.y, spiky.width, spiky.height);
    ctx.fillRect(spiky.x + cvs.width - spiky.width, spiky.y, spiky.width, spiky.height);
    ctx.fillStyle = spiky.strokeColor;
    ctx.font = "20px Germania One";
    ctx.fillText("Reset!", spiky.x, spiky.y+ spiky.height/2);
    ctx.fillText("Reset!", spiky.x+ cvs.width - spiky.width, (spiky.y)+ spiky.height/2);

}
function moveSpiky(){ // move Spiky Dynamics
    if(spiky.y + spiky.height > wood.y || spiky.y  < 150){
        spiky.dy = -spiky.dy;
    }
   spiky.y += spiky.dy;
}
function ballSpikyColl(dx, dy) { // check touch between ball and Spiky

    if (ball.x + ball.radius > spiky.x + dx &&
        ball.x - ball.radius < spiky.x + dx + spiky.width &&
        ball.y + ball.radius > spiky.y + dy &&
        ball.y - ball.radius < spiky.y + dy + spiky.height) {
            LIFE_LOST.play();
            resetBall();

    }
}

function showText() { // show score, level, liveNo
    $("p#score").text(score);
    $("p#live").text(LIFE);
    $("p#lv").text(LEVEL);

}

function gameOver() { // gameOver
    if (LIFE < 0) {
        GAME_OVER = true;
        $(".resultText").show();
        $("#play_again_btn").show();
        $("#start_btn").hide();
        $(".levelForm").hide();
    }

}

function levelUp() { // level up in each level
    let win = true;
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.col; c++) {
            win = win && !bricks[r][c].status;
        }
    }

    if (win) {
        WIN.play();
        if (LEVEL >= MAX_LEVEL) {
            $(".resultText").text("You Win!");
            $(".resultText").show();
            $(".gif").show();
            $("#play_again_btn").show();
            $(".levelForm").hide();
            GAME_OVER = true;
            return;
        }

           brick.row++;
           createBricks();
           ball.speed += 1;
           resetBall();
           LEVEL++;
           barricade.y += 45;
           barricadeDynamics.y += 45;
           barricadeVertical.y += 45;

    }
}


function draw() { // draw on canvas
    drawWood();
    drawBall();
    drawBricks();

    if (levelOption == 2) {
        drawBarricade();
    }
    else if (levelOption == 3) {
        drawBarricadeMatrix();
    }
    else if (levelOption == 4) {
        drawBarricadeDynamic();
    }
    else if (levelOption == 5) {
        drawBarricadeVertical();
    }
    else if (levelOption == 6) {
        drawSpiky();
    }

    showText();
}

function update() { // update game
    moveWood();
    moveBall();
    moveBarricadeDynamics();
    moveBarricadeVertical();
    moveSpiky();
    ballWallColl();
    ballWoodColl();
    ballBrickColl();
    if (levelOption == 2) {
        ballBarricadeColl(0, 0,0,0);
        ballBarricadeColl(450, 0,0,0);
    }
    else if (levelOption == 3) {
        ballBarricadeColl(0, 20,0,0);
        ballBarricadeColl(400, 100,50,0);
        ballBarricadeColl(0, 200,40,0);
    }
    else if (levelOption == 4) {
        ballBarricadeDynamicsColl();
    }

    else if (levelOption == 5) {
        ballBarricadeVerticalColl(0, 0);
        ballBarricadeVerticalColl(280, 0);
    }
    else if (levelOption == 6) {
        ballSpikyColl(0, 0);
        ballSpikyColl(550, 0);
    }

    gameOver();
    levelUp();

}

function loop() { // loop for game
    setBr();
    draw();
    update();
    if (!GAME_OVER) {
        requestAnimationFrame(loop);
    }
}

$("#play_again_btn").click(function () { // replay game
    location.reload();
})
$('select').on('change', function () {// get value option level
    levelOption = this.value;
});
$("#start_btn").click(function () {  // method of start button
    loop();
    $("#start_btn").hide();
    $("#level").hide();
    let n = $( "#level option:selected" ).text();
    $(".labelText").text("Now Level: "+ n);
    $("#play_again_btn").show();
})




