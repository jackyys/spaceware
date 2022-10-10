// ===================== Fall 2022 EECS 493 Assignment 3 =====================
// This starter code provides a structure and helper functions for implementing
// the game functionality. It is a suggestion meant to help you, and you are not
// required to use all parts of it. You can (and should) add additional functions
// as needed or change existing functions.

// ==================================================
// ============ Page Scoped Globals Here ============
// ==================================================

// Div Handlers
let game_window;
let game_screen;
let onScreenAsteroid;

// Difficulty Helpers
let astProjectileSpeed = 3;          // easy: 1, norm: 3, hard: 5

// Game Object Helpers
let currentAsteroid = 1;
let AST_OBJECT_REFRESH_RATE = 15;

let maxPersonPosX = 1218;
let maxPersonPosY = 658;
let PERSON_SPEED = 5;                // Speed of the person
let vaccineOccurrence = 20000;       // Vaccine spawns every 20 seconds
let vaccineGone = 5000;              // Vaccine disappears in 5 seconds
let maskOccurrence = 15000;          // Masks spawn every 15 seconds
let maskGone = 5000;                 // Mask disappears in 5 seconds

// Movement Helpers
var LEFT = false;
var RIGHT = false;
var UP = false;
var DOWN = false;
var touched = false;

let slider;
let demo;
let Difficulty = "normal";
let firstTime = true;
let level_count = 1;
let danger = 20;
let spawn_rate = 800; // milliseconds
let difficulty_dict = {
  "easy": 1,
  "normal": 3,
  "hard": 5
}
let danger_dict = {
  "easy": 10,
  "normal": 20,
  "hard": 30
}
let rocket;
let rocket_speed = 5;
let score = 0;

// Intervals
let rocketInterval;
let spawnInterval;
let shieldGeneratedInterval;
let portalGeneratedInterval;
let scoreInterval;

// Audios
let DIE = new Audio("src/audio/die.mp3");
let PEW = new Audio("src/audio/pew.mp3");
let COLLECT = new Audio("src/audio/collect.mp3");

// slider.on('input', function() {
//   currentVolume = this.value;
//   $("#demo").html(this.value);
//   console.log(this.value);
// })

// ==============================================
// ============ Functional Code Here ============
// ==============================================

// Main
$(document).ready(function () {
  // ====== Startup ====== 
  game_window = $('.game-window');
  game_screen = $("#actual_game");
  onScreenAsteroid = $('.curAstroid');
  getLandingPage();
  slider = $("#myRange");
  demo = $("#demo");
  slider.on("input", function() {
    demo.html(slider[0].value);
  })
  // TODO: ADD MORE
  // spawn(); // Example: Spawn an asteroid that travels from one border to another
  // while (true) {
  //   setTimeout(spawn, spawn_rate);
  // }
});

function getLandingPage() {
  $('#landing_page').show();
  $("#landing_page button").show();
  $('#setting_page').hide();
  $('#tutorial_page').hide();
  $('#actual_game').hide();
  $('#over_page').hide();
}

function showSetting() {
  $('#setting_page').show();
  $('#setting_page').css("z-index", 100);
  demo.html(slider[0].value);
  $("#" + Difficulty).css("border-color", "yellow");
}

function closeSetting() {
  $('#setting_page').hide();
}

// TODO: ADD YOUR FUNCTIONS HERE
function setEasy() {
  $("#" + Difficulty).css("border-color", "black");
  $("#easy").css("border-color", "yellow");
  Difficulty = "easy";
  danger = 10;
  astProjectileSpeed = 1;
  spawn_rate = 1000;
}

function setNormal() {
  $("#" + Difficulty).css("border-color", "black");
  $("#normal").css("border-color", "yellow");
  Difficulty = "normal";
  danger = 20;
  astProjectileSpeed = 3;
  spawn_rate = 800;
}

function setHard() {
  $("#" + Difficulty).css("border-color", "black");
  $("#hard").css("border-color", "yellow");
  Difficulty = "hard";
  danger = 30;
  astProjectileSpeed = 5;
  spawn_rate = 600;
}

function playGame() {
  if (firstTime) {
    $("#tutorial_page").show();
    firstTime = false;
  } else {
    startGame();
  }
}

function startGame() {
  $("#tutorial_page").hide();
  $("#get_ready_window").show();
  $('#landing_page').hide();
  $("#over_page").hide();
  $('#actual_game').show();
  $('.asteroidSection').hide();
  $('#danger_num').html(danger);
  $('#level_num').html(level_count);
  setTimeout(
    function() {
      $("#get_ready_window").hide();
      $('.asteroidSection').show();
      rocket = new Rocket();  
      spawnInterval = setInterval(spawn, spawn_rate);
      rocketInterval = setInterval(moveRocket, 10);
      shieldGeneratedInterval = setInterval(shieldAppear, 15000);
      portalGeneratedInterval = setInterval(portalAppear, 20000);
      scoreInterval = setInterval(increaseScore, 500);
      astProjectileSpeed = difficulty_dict[Difficulty];
      danger = danger_dict[Difficulty];
      $("#danger_num").html(danger);
    }, 3000
  );
}

function increaseScore() {
  score += 40;
  $("#score_num").html(score);
}

function portalAppear() {
  let portalString = "<div id = 'portal-" + currentAsteroid + "' class = 'curAstroid' > <img src='src/port.gif'/></div>";
  onScreenAsteroid.append(portalString);
  let portal = $("#portal-" + currentAsteroid);
  currentAsteroid++;
  var x = Math.floor(Math.random() * (1210));
  var y = Math.floor(Math.random() * (640));
  portal.css('top', y);
  portal.css('right', x);
  var portalInterval = setInterval(function() {
    if (isColliding(rocket.id, portal)) {
      portal.remove();
      COLLECT.volume = slider[0].value / 100.0;
      COLLECT.play();
      clearInterval(portalInterval);
      level_count++;
      danger += 2;
      astProjectileSpeed += astProjectileSpeed * 0.2;
      //play sound
      $('#level_num').html(level_count);
      $("#danger_num").html(danger);
    }
  }, 50);
  setTimeout(function() {
    portal.remove();
    clearInterval(portalInterval);
  }, 5000);
}

function shieldAppear() {
  let shieldString = "<div id = 'shield-" + currentAsteroid + "' class = 'curAstroid' > <img src='src/shield.gif'/></div>";
  onScreenAsteroid.append(shieldString);
  let shield = $("#shield-" + currentAsteroid);
  currentAsteroid++;
  var x = Math.floor(Math.random() * (1210));
  var y = Math.floor(Math.random() * (640));
  shield.css('top', y);
  shield.css('right', x);
  var shieldInterval = setInterval(function() {
    if (isColliding(rocket.id, shield)) {
      rocket.shield = true;
      rocket.img.attr("src", "src/player_shielded.gif");
      shield.remove();
      COLLECT.volume = slider[0].value / 100.0;
      COLLECT.play();
      clearInterval(shieldInterval);
    }
  }, 50);
  setTimeout(function() {
    shield.remove();
    clearInterval(shieldInterval);
  }, 5000);
}

// Keydown event handler
document.onkeydown = function (e) {
  if (e.key == 'ArrowLeft') LEFT = true;
  if (e.key == 'ArrowRight') RIGHT = true;
  if (e.key == 'ArrowUp') UP = true;
  if (e.key == 'ArrowDown') DOWN = true;
}

// Keyup event handler
document.onkeyup = function (e) {
  if (e.key == 'ArrowLeft') LEFT = false;
  if (e.key == 'ArrowRight') RIGHT = false;
  if (e.key == 'ArrowUp') UP = false;
  if (e.key == 'ArrowDown') DOWN = false;
}

function game_over() {
  $("#landing_page").show();
  $("#landing_page button").hide();
  $("#tutorial_page").hide();
  $('#actual_game').hide();
  $('.asteroidSection').hide();
  $("#over_page").show();
  $("#final_score").html(score);
  clearInterval(spawnInterval);
  clearInterval(rocketInterval);
  clearInterval(shieldGeneratedInterval);
  clearInterval(portalGeneratedInterval);
  clearInterval(scoreInterval);
  rocket.id.remove();
  score = 0;
  level_count = 1;
  danger = danger_dict[Difficulty];
  $("#level_num").html(level_count);
  $("#danger_num").html(danger);
}

// Starter Code for randomly generating and moving an asteroid on screen
// Feel free to use and add additional methods to this class
class Rocket {
  constructor() {
    let rockString = "<div id='rocket'> <img id='rocket_img' src='src/player/player.gif'/></div>";
    game_screen.append(rockString);
    this.cur_x = 605;
    this.cur_y = 320;
    this.next_x = 605;
    this.next_y = 320;
    this.id = $("#rocket");
    this.img = $("#rocket_img");
    this.id.css('position', 'absolute');
    this.shield = false;
  }

  checkBorder() {
    if (this.next_x <= 0) {
      this.next_x = 0;
    }
    if (this.next_x >= 1210) {
      this.next_x = 1210;
    }
    if (this.next_y >= 640) {
      this.next_y = 640;
    }
    if (this.next_y <= 0) {
      this.next_y = 0;
    }
  }
}

function moveRocket() {
  if (LEFT) {
    rocket.next_x = rocket.cur_x + rocket_speed;
    if (rocket.shield) {
      rocket.img.attr('src', "src/player/player_shielded_left.gif");
    } else {
      rocket.img.attr('src', "src/player/player_left.gif");
    }
  } else if (RIGHT) {
    rocket.next_x = rocket.cur_x - rocket_speed;
    if (rocket.shield) {
      rocket.img.attr('src', "src/player/player_shielded_right.gif");
    } else {
      rocket.img.attr('src', "src/player/player_right.gif");
    }
  } else if (DOWN) {
    rocket.next_y = rocket.cur_y + rocket_speed;
    if (rocket.shield) {
      rocket.img.attr('src', "src/player/player_shielded_down.gif");
    } else {
      rocket.img.attr('src', "src/player/player_down.gif");
    }
  } else if (UP) {
    rocket.next_y = rocket.cur_y - rocket_speed;
    if (rocket.shield) {
      rocket.img.attr('src', "src/player/player_shielded_up.gif");
    } else {
      rocket.img.attr('src', "src/player/player_up.gif");
    }
  } else {
    if (rocket.shield) {
      rocket.img.attr('src', "src/player/player_shielded.gif");
    } else {
      rocket.img.attr('src', "src/player/player.gif");
    }
  }
  // update asteroid's css position
  rocket.checkBorder();
  rocket.cur_x = rocket.next_x;
  rocket.cur_y = rocket.next_y;
  rocket.id.css('top', rocket.cur_y);
  rocket.id.css('right', rocket.cur_x);
}

class Asteroid {
  // constructs an Asteroid object
  constructor() {
      /*------------------------Public Member Variables------------------------*/
      // create a new Asteroid div and append it to DOM so it can be modified later
      let objectString = "<div id = 'a-" + currentAsteroid + "' class = 'curAstroid' > <img src = 'src/asteroid.png'/></div>";
      onScreenAsteroid.append(objectString);
      // select id of this Asteroid
      this.id = $('#a-' + currentAsteroid);
      currentAsteroid++; // ensure each Asteroid has its own id
      // current x, y position of this Asteroid
      this.cur_x = 0; // number of pixels from right
      this.cur_y = 0; // number of pixels from top

      /*------------------------Private Member Variables------------------------*/
      // member variables for how to move the Asteroid
      this.x_dest = 0;
      this.y_dest = 0;
      // member variables indicating when the Asteroid has reached the boarder
      this.hide_axis = 'x';
      this.hide_after = 0;
      this.sign_of_switch = 'neg';
      // spawn an Asteroid at a random location on a random side of the board
      this.#spawnAsteroid();
  }

  // Requires: called by the user
  // Modifies:
  // Effects: return true if current Asteroid has reached its destination, i.e., it should now disappear
  //          return false otherwise
  hasReachedEnd() {
      if(this.hide_axis == 'x'){
          if(this.sign_of_switch == 'pos'){
              if(this.cur_x > this.hide_after){
                  return true;
              }                    
          }
          else{
              if(this.cur_x < this.hide_after){
                  return true;
              }          
          }
      }
      else {
          if(this.sign_of_switch == 'pos'){
              if(this.cur_y > this.hide_after){
                  return true;
              }                    
          }
          else{
              if(this.cur_y < this.hide_after){
                  return true;
              }          
          }
      }
      return false;
  }

  // Requires: called by the user
  // Modifies: cur_y, cur_x
  // Effects: move this Asteroid 1 unit in its designated direction
  updatePosition() {
      // ensures all asteroids travel at current level's speed
      this.cur_y += this.y_dest * astProjectileSpeed;
      this.cur_x += this.x_dest * astProjectileSpeed;
      // update asteroid's css position
      this.id.css('top', this.cur_y);
      this.id.css('right', this.cur_x);
  }

  // Requires: this method should ONLY be called by the constructor
  // Modifies: cur_x, cur_y, x_dest, y_dest, num_ticks, hide_axis, hide_after, sign_of_switch
  // Effects: randomly determines an appropriate starting/ending location for this Asteroid
  //          all asteroids travel at the same speed
  #spawnAsteroid() {
      // REMARK: YOU DO NOT NEED TO KNOW HOW THIS METHOD'S SOURCE CODE WORKS
      let x = getRandomNumber(0, 1280);
      let y = getRandomNumber(0, 720);
      let floor = 784;
      let ceiling = -64;
      let left = 1344;
      let right = -64;
      let major_axis = Math.floor(getRandomNumber(0, 2));
      let minor_aix =  Math.floor(getRandomNumber(0, 2));
      let num_ticks;

      if(major_axis == 0 && minor_aix == 0){
          this.cur_y = floor;
          this.cur_x = x;
          let bottomOfScreen = game_screen.height();
          num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed);

          this.x_dest = (game_screen.width() - x);
          this.x_dest = (this.x_dest - x)/num_ticks + getRandomNumber(-.5,.5);
          this.y_dest = -astProjectileSpeed - getRandomNumber(0, .5);
          this.hide_axis = 'y';
          this.hide_after = -64;
          this.sign_of_switch = 'neg';
      }
      if(major_axis == 0 && minor_aix == 1){
          this.cur_y = ceiling;
          this.cur_x = x;
          let bottomOfScreen = game_screen.height();
          num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed);

          this.x_dest = (game_screen.width() - x);
          this.x_dest = (this.x_dest - x)/num_ticks + getRandomNumber(-.5,.5);
          this.y_dest = astProjectileSpeed + getRandomNumber(0, .5);
          this.hide_axis = 'y';
          this.hide_after = 784;
          this.sign_of_switch = 'pos';
      }
      if(major_axis == 1 && minor_aix == 0) {
          this.cur_y = y;
          this.cur_x = left;
          let bottomOfScreen = game_screen.width();
          num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed);

          this.x_dest = -astProjectileSpeed - getRandomNumber(0, .5);
          this.y_dest = (game_screen.height() - y);
          this.y_dest = (this.y_dest - y)/num_ticks + getRandomNumber(-.5,.5);
          this.hide_axis = 'x';
          this.hide_after = -64;
          this.sign_of_switch = 'neg';
      }
      if(major_axis == 1 && minor_aix == 1){
          this.cur_y = y;
          this.cur_x = right;
          let bottomOfScreen = game_screen.width();
          num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed);

          this.x_dest = astProjectileSpeed + getRandomNumber(0, .5);
          this.y_dest = (game_screen.height() - y);
          this.y_dest = (this.y_dest - y)/num_ticks + getRandomNumber(-.5,.5);
          this.hide_axis = 'x';
          this.hide_after = 1344;
          this.sign_of_switch = 'pos';
      }
      // show this Asteroid's initial position on screen
      this.id.css("top", this.cur_y);
      this.id.css("right", this.cur_x);
      // normalize the speed s.t. all Asteroids travel at the same speed
      let speed = Math.sqrt((this.x_dest)*(this.x_dest) + (this.y_dest)*(this.y_dest));
      this.x_dest = this.x_dest / speed;
      this.y_dest = this.y_dest / speed;
  }
}

// Spawns an asteroid travelling from one border to another
function spawn() {
  let asteroid = new Asteroid();
  setTimeout(spawn_helper(asteroid), 0);
}

function spawn_helper(asteroid) {
  let astermovement = setInterval(function () {
    // update asteroid position on screen
    asteroid.updatePosition();
    if (isColliding(rocket.id, asteroid.id)) {
      if (!rocket.shield) {
        rocket.img.attr("src", "src/player_touched.gif");
        DIE.volume = slider[0].value / 100.0;
        DIE.play();
        game_over();
      } else {
        rocket.shield = false;
        rocket.img.attr("src", "src/player.gif");
        asteroid.id.remove();
        clearInterval(astermovement);
      }
    }
    // determine whether asteroid has reached its end position, i.e., outside the game border
    if (asteroid.hasReachedEnd()) {
      asteroid.id.remove();
      clearInterval(astermovement);
    }
  }, AST_OBJECT_REFRESH_RATE);
}

//===================================================

// ==============================================
// =========== Utility Functions Here ===========
// ==============================================

// Are two elements currently colliding?
function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

// Will two elements collide soon?
// Input: Two elements, upcoming change in position for the moving element
function willCollide(o1, o2, o1_xChange, o1_yChange) {
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Are two elements colliding or will they collide soon?
// Input: Two elements, upcoming change in position for the moving element
// Use example: isOrWillCollide(paradeFloat2, person, FLOAT_SPEED, 0)
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange) {
  const o1D = {
    'left': o1.offset().left + o1_xChange,
    'right': o1.offset().left + o1.width() + o1_xChange,
    'top': o1.offset().top + o1_yChange,
    'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = {
    'left': o2.offset().left,
    'right': o2.offset().left + o2.width(),
    'top': o2.offset().top,
    'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
    // collision detected!
    return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max) {
  return (Math.random() * (max - min)) + min;
}
