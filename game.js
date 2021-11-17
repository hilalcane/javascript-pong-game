(async () => {
    //import jquery library
    await import('https://code.jquery.com/jquery-3.4.1.min.js');
    //libary ready
    console.log('jQuery ready!');
    // disable scrolling in body
    document.body.setAttribute('style', 'overflow:hidden !important');
    game();
})();

function game() {
    var CSS = {
        background: {
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            zIndex: '9999999',
            top: 0,
            background: 'black',
            opacity: 0.8
        },
        arena: {
            width: 900,
            height: 600,
            background: '#62247B',
            position: 'fixed',
            top: '50%',
            left: '50%',
            zIndex: '99999999',
            transform: 'translate(-50%, -50%)'
        },
        ball: {
            width: 15,
            height: 15,
            position: 'absolute',
            top: 0,
            left: 350,
            background: '#C6A62F'
        },
        line: {
            width: 0,
            height: 600,
            borderLeft: '2px dashed #C6A62F',
            position: 'absolute',
            top: 0,
            left: '50%'
        },
        stick: {
            width: 12,
            height: 85,
            position: 'absolute',
            background: '#C6A62F'
        },
        stick1: {
            left: 0,
            top: 250
        },
        stick2: {
            left: 888,
            top: 250
        },
        score1: {
            position: 'absolute',
            top: -80,
            left: 200,
            fontSize: 70,
            color: '#C6A62F'
        },
        score2: {
            position: 'absolute',
            top: -80,
            right: 200,
            fontSize: 70,
            color: '#C6A62F'
        },
        winnerStatus: {
            position: 'absolute',
            color: '#C6A62F',
            fontSize: 75,
            top: 100,
            left: 150
        },
        gameOptions: {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 900,
            height: 600,
            zIndex: '999999999999999999'
        },
        gameOptionButtons: {
            padding: '20px 40px',
            background: '#eee',
            margin: 20
        },
        gameOptionHeadig: {
            position: 'absolute',
            left: 150,
            fontSize: 75,
            top: 0,
            color: '#C6A62F',
        }
    };

    var CONSTS = {
        gameSpeed: 10,
        score1: 0,
        score2: 0,
        stick1Speed: 0,
        stick2Speed: 0,
        ballTopSpeed: 0,
        ballLeftSpeed: 0,
        winner: '',
        gameMode: ''
    };

    function init() {
        draw();
        getScore();
        options();
    }

    function start() {
        setEvents();
        roll();
        loop();
    }

    // when the game starts, if there is a saved score in the local, get it
    function getScore() {
        const score = JSON.parse(localStorage.getItem('score'));
        // if there is a score in local it syncs them
        if (score !== null) {
            CONSTS.score1 = score.score1;
            CONSTS.score2 = score.score2;
            // update score in the DOM
            $('#score1').html(CONSTS.score1);
            $('#score2').html(CONSTS.score2);
        }
    }

    function options() {

        $("button").click(function () {
            // get clicked button id
            const buttonId = $(this).attr('id');
            // set gameMode by button id
            switch (buttonId) {
                case 'player-vs-ai':
                    CONSTS.gameMode = 'single';
                    break;
                case 'player-vs-player':
                    CONSTS.gameMode = 'pvp'
                    break;
                case 'ai-vs-ai':
                    CONSTS.gameMode = 'ai'
                default:
                    break;
            }
            // clear game options from window
            $("#game-options").css('display', 'none');
            // start game
            start();

        });

    }


    function draw() {
        $('<div/>', { id: 'background' }).css(CSS.background).appendTo('body');
        $('<div/>', { id: 'pong-game' }).css(CSS.arena).appendTo('body');
        $('<div/>', { id: 'game-options' }).css(CSS.gameOptions).appendTo('#pong-game');
        $('<h4 id="game-mode-heading">Select Game Mode</h4>').css(CSS.gameOptionHeadig).appendTo('#game-options');
        $('<button id="player-vs-ai">Player vs AI</button>').css(CSS.gameOptionButtons).appendTo('#game-options');
        $('<button id="player-vs-player">Player vs Player</button>').css(CSS.gameOptionButtons).appendTo('#game-options');
        $('<button id="ai-vs-ai">AI vs AI</button>').css(CSS.gameOptionButtons).appendTo('#game-options');
        $('<div/>', { id: 'score1' }).css(CSS.score1).appendTo('#pong-game').html(CONSTS.score1);
        $('<div/>', { id: 'score2' }).css(CSS.score2).appendTo('#pong-game').html(CONSTS.score2);
        $('<div/>', { id: 'pong-line' }).css(CSS.line).appendTo('#pong-game');
        $('<div/>', { id: 'pong-ball' }).css(CSS.ball).appendTo('#pong-game');
        $('<div/>', { id: 'stick-1' }).css($.extend(CSS.stick1, CSS.stick))
            .appendTo('#pong-game');
        $('<div/>', { id: 'stick-2' }).css($.extend(CSS.stick2, CSS.stick))
            .appendTo('#pong-game');
    }

    function setEvents() {
        // events when the key is pressed
        $(document).on('keydown', function (e) {
            //#region player 1

            // if game mode pvp or single player 1 can be play with w,s buttons
            if (CONSTS.gameMode === 'pvp' || CONSTS.gameMode === 'single') {
                //cWhen the key with the keycode 87 is pressed, the speed decreases upwards by 10
                if (e.keyCode == 87) {
                    CONSTS.stick1Speed = -10;
                }
                // if the key with code 83 is pressed, its speed is assigned 10
                if (e.keyCode === 83) {
                    CONSTS.stick1Speed = 10;
                }
            }
            //#endregion player1

            //#region player 2

            // player 2 can be play only game mode is pvp (arrow-up and arrow-down buttons)
            if (CONSTS.gameMode === 'pvp') {
                if (e.keyCode == 38) {
                    CONSTS.stick2Speed = -10;
                }
                if (e.keyCode === 40) {
                    CONSTS.stick2Speed = 10;
                }
            }
            //#endregion player 2
        });
        // if the keys w and s are pulled, set the speed to zero
        $(document).on('keyup', function (e) {

            if (e.keyCode == 87 || e.keyCode == 83) {
                CONSTS.stick1Speed = 0;
            }

            if (e.keyCode == 38 || e.keyCode == 40) {
                CONSTS.stick2Speed = 0;
            }
        });
    }

    function loop() {
        // repeats a function every x milliseconds based on game speed
        window.pongLoop = setInterval(function () {
            // adds stickspeed to stick1.top
            CSS.stick1.top += CONSTS.stick1Speed;
            // if stick.top is at the top of the canvas and its velocity is less than zero,
            // still trying to get up makes the stick1.top equal to 0 
            if (CSS.stick1.top <= 0 && CONSTS.stick1Speed < 0) {
                CSS.stick1.top = 0;
            }
            // same
            if (CSS.stick1.top >= (CSS.arena.height - 85) && CONSTS.stick1Speed > 0) {
                CSS.stick1.top = CSS.arena.height - 85;
            }

            CSS.stick2.top += CONSTS.stick2Speed;
            // if stick.top is at the top of the canvas and its velocity is less than zero,
            // still trying to get up makes the stick1.top equal to 0 
            if (CSS.stick2.top <= 0 && CONSTS.stick2Speed < 0) {
                CSS.stick2.top = 0;
            }
            // same
            if (CSS.stick2.top >= (CSS.arena.height - 85) && CONSTS.stick2Speed > 0) {
                CSS.stick2.top = CSS.arena.height - 85;
            }
            // updates the position of the stick1 in the document
            $('#stick-1').css('top', CSS.stick1.top);
            $('#stick-2').css('top', CSS.stick2.top);

            CSS.ball.top += CONSTS.ballTopSpeed;
            CSS.ball.left += CONSTS.ballLeftSpeed;


            if (CSS.ball.top <= 0 ||
                CSS.ball.top >= CSS.arena.height - CSS.ball.height) {
                CONSTS.ballTopSpeed = CONSTS.ballTopSpeed * -1;
            }

            $('#pong-ball').css({ top: CSS.ball.top, left: CSS.ball.left });

            if (CSS.ball.left <= CSS.stick.width) {
                CSS.ball.top > CSS.stick1.top && CSS.ball.top < CSS.stick1.top + CSS.stick.height && (CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1) || roll();
            }

            if (CSS.ball.left >= CSS.arena.width - CSS.ball.width - CSS.stick.width) {
                CSS.ball.top > CSS.stick2.top && CSS.ball.top < CSS.stick2.top + CSS.stick.height && (CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1) || roll();
            }

            // ai follow the ball with comLvl speed
            if (CONSTS.gameMode === 'single') {
                let aiSpeed = 0.07;
                CSS.stick2.top += (CSS.ball.top - (CSS.stick2.top + CSS.stick2.height / 2)) * aiSpeed;
            }

            if (CONSTS.gameMode === 'ai') {
                let ai1Speed = 0.07;
                let ai2Speed = 0.06;
                CSS.stick1.top += (CSS.ball.top - (CSS.stick1.top + CSS.stick1.height / 2)) * ai1Speed;
                CSS.stick2.top += (CSS.ball.top - (CSS.stick2.top + CSS.stick2.height / 2)) * ai2Speed;
            }
        }, CONSTS.gameSpeed);
    }

    function roll() {
        // updates score every round
        updateScore();

        if (CONSTS.score1 >= 5) {
            CONSTS.winner = 'Winner is Player1';
            gameOver();
        }
        else if (CONSTS.score2 >= 5) {
            CONSTS.winner = 'Winner is Player2';
            gameOver();

        } else {
            var side = -1;

            if (Math.random() < 0.5) {
                side = 1;
            }

            CONSTS.ballTopSpeed = Math.random() * -2 - 3;
            CONSTS.ballLeftSpeed = side * (Math.random() * 2 + 3);
            CSS.ball.top = 300;
            CSS.ball.left = 450;
        }
    }

    function updateScore() {
        if (CSS.ball.left <= CSS.stick.width) {
            CONSTS.score2 += 1;
        }
        if (CSS.ball.left >= CSS.arena.width - CSS.ball.width - CSS.stick.width) {
            CONSTS.score1 += 1;
        }

        $('#score1').html(CONSTS.score1);
        $('#score2').html(CONSTS.score2);

        // Make scores an object to add the local every time the score is updateds
        const score = {
            score1: CONSTS.score1,
            score2: CONSTS.score2
        };

        // create a field in the local called score and equalize its value to the score in the game
        localStorage.setItem(
            'score',
            JSON.stringify(score)
        );
    }

    function gameOver() {
        $('#pong-ball').css('display', 'none');
        clearInterval(window.pongLoop);

        $('<div/>', { id: 'winner-status' }).css(CSS.winnerStatus).appendTo('#pong-game').html(CONSTS.winner);
        $('#pong-game').css('filter', 'grayscale(100%)');
        // delete the local score when the game is over
        localStorage.removeItem('score');

    }

    init();

}