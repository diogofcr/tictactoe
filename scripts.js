// Whole-script strict mode syntax
'use strict';

((rows, cols) => { //Creates 3x3 grid
    const gameboard = document.getElementById("gameboard");
    gameboard.style.setProperty('--grid-rows', rows);
    gameboard.style.setProperty('--grid-cols', cols);
    for (let c = 0; c < (rows * cols); c++) {
        let cell = document.createElement("div");
        cell.id = c;
        gameboard.appendChild(cell).className = "grid-item";
        cell.addEventListener("click", () => game.choice(cell)); //Event listener hover on div
    };
})(3, 3);

//-------------------------------------- Players ---------------------------------------------------
function Player(name,symbol) {
    let score = 0;
    
    const checkScore = () => {
        return score
    }

    const increaseScore = () => {
        displayController.updateScore(symbol,++score);
    }

    return {name,symbol,checkScore,increaseScore}
};

const player1 = Player(null,"X");
const player2 = Player("AI","O"); //Creates a player with name AI and symbol O

//-------------------------------------- Display Control ---------------------------------------------------
const displayController = (() => {
    const update = (symbol,position) => {
        position.classList.add(symbol);
    };

    const clear = () => {
        let cell = document.getElementsByClassName("grid-item");
        for (var i=0, len=cell.length|0; i<len; i=i+1|0) { //Removes all X and O classes from the grid-items
            cell[i].classList.remove("X");
            cell[i].classList.remove("O");
        }
        if (document.getElementById("gameover")) document.getElementById("gameover").remove(); //If the gameover menu exists it removes it.
    };
    
    const gameOver = (winner) => {
            //-- Create elements
            let gameover = document.createElement("div");
            gameover.id = "gameover";
            let title = document.createElement("h1"); //Title
            title.style.marginTop = "5%";
            let symbol = document.createElement("img"); //Symbol
            if (winner.name) {
                title.textContent = "WINNER!"
                symbol.src = `images/${winner.symbol}.png`;
                symbol.style.width = "50%";
            } else {
                title.textContent = "DRAW!"
                symbol.src = `images/draw.png`;
                symbol.style.width = "70%";
            }
            //Append title and symbol to gameover div
            gameover.appendChild(symbol);
            gameover.appendChild(title);
            //Append div to gameboard;
            document.getElementById("main").appendChild(gameover);
            //Event listener
            gameover.addEventListener("click", game.reset);
    };

    const startGame = () => {
        //Create scoreboard paragraphs
        for(let i=1; i<=2; i++) {
            let player = (i===1) ? player1 : player2;
            let playerdiv = document.getElementById("player"+i);
            let name = document.createElement("p");
            name.textContent = player.name;
            let symbol = document.createElement("img");
            symbol.src = `images/${player.symbol}.png`;
            symbol.classList.add(player.symbol+"div")
            let score = document.createElement("p");
            score.textContent = player.checkScore();
            score.id = `score`+player.symbol;
            playerdiv.appendChild(symbol);
            playerdiv.appendChild(name);
            playerdiv.appendChild(score);
            playerdiv.classList.add("scoreboard");
        }
    };

    const changeTurn = (turn) => {
        document.getElementById("player1").classList.remove("flashing");
        document.getElementById("player2").classList.remove("flashing");
        turn ? document.getElementById("player1").classList.add("flashing") : document.getElementById("player2").classList.add("flashing");
        if(!turn) AI.play(player2); //If turn==false (means it is AI turn) makes AI play
    };

    const updateScore = (symbol,score) => {
        document.getElementById("score"+symbol).textContent = score;
    };

    const _chooseName = (() => {
        //-- Create elements
        let choose = document.createElement("div");
        choose.id = "choosename";
        let title = document.createElement("h2"); //Title
        title.style.marginTop = "5%";
        let input = document.createElement("input"); //Input field for name
        title.textContent = "Choose your name:"
        input.setAttribute('type', 'text');
        input.setAttribute('maxlength', '15');
        //Done button
        let donebutton = document.createElement("button");
        donebutton.id = "done";
        donebutton.textContent = "Done";
        //Create difficulty button
        let difficultydiv = document.createElement("div");
        let easydiv = document.createElement("div");
        let easyinput = document.createElement("input");
        let easylabel = document.createElement("label");
        let harddiv = document.createElement("div");
        let hardinput = document.createElement("input");
        let hardlabel = document.createElement("label");
        easydiv.appendChild(easyinput);
        easydiv.appendChild(easylabel);
        easydiv.id = "easydiv";
        harddiv.appendChild(hardinput);
        harddiv.appendChild(hardlabel);
        harddiv.id = "harddiv";
        difficultydiv.id = "difficultydiv";
        difficultydiv.appendChild(easydiv);
        difficultydiv.appendChild(harddiv);
        easylabel.textContent = "Easy";
        easylabel.setAttribute('for', 'easy');
        easyinput.setAttribute('type', 'radio');
        easyinput.id = "easy";
        easyinput.setAttribute('name', 'difficulty');
        hardlabel.textContent = "Hard";
        hardlabel.setAttribute('for', 'hard');
        hardinput.setAttribute('type', 'radio');
        hardinput.id = "hard";
        hardinput.setAttribute('name', 'difficulty');
        //Append title and symbol to choose screen
        choose.appendChild(title);
        choose.appendChild(input);
        choose.appendChild(difficultydiv);
        choose.appendChild(donebutton);
        //Append div to gameboard;
        document.getElementById("main").appendChild(choose);
        (easyinput.checked)
        donebutton.addEventListener("click", () => {
            if (input.value && (easyinput.checked || hardinput.checked)) {
                player1.name = input.value;
                (easyinput.checked) ? game.difficulty = "easy" : game.difficulty = "hard"; //If easy is checked set game.difficulty to easy, if not set it to hard
                choose.remove(); //Remove the choose div
                startGame(); //Add the scoreboard
                document.getElementById("scoreboard").classList.add('after');
                game.start();
            }
        });

    })();

    return {update,clear,gameOver,changeTurn,updateScore}
})();

//-------------------------------------- Game logic ---------------------------------------------------
const gameBoard = (() => { //Current gameboard values
    const _gameBoard = [null,null,null,null,null,null,null,null,null];
    
    const changeValue = (symbol,position) => { //Changes value of that gameBoard position to the player symbol
        _gameBoard[position.id] = symbol;
        displayController.update(symbol,position);
    };

    const clear = () => {
        _gameBoard.forEach((o, i, a) => a[i] = null); //Change every value of _gameBoard to null
    };

    const display = () => {
        return _gameBoard;
    };

    return {changeValue,clear,display}
})();

const game = (() => {
    let turn = Math.random() >= 0.5; //Random start the 1st round
    let playCount=0;
    let gameOver=true;

    const start = () => {
        displayController.changeTurn(turn);
        gameOver=false;
    };

    const play = (player,position) => {
        let winnersymbol;
        if (!gameOver) { //Only play if game is not over
            if (!gameBoard.display()[position.id]) { //Only change the value if that gameboard position is null
                gameBoard.changeValue(player.symbol,position);
                playCount++;
                if(playCount >= 5) { //Only start checking Winner after 5th play, before then there can be none
                    winnersymbol = checkWinner(gameBoard.display());
                    if (winnersymbol) return endGame(winnersymbol); //Returns so if the game is over the turn doesnt change
                }
                turn = !turn;
                displayController.changeTurn(turn);
            }
        }
    };
    
    const choice = (position) => {
        if (turn) play(player1,position);
    };
    
    const endGame = (winnersymbol) => {
        gameOver = true;
        let winner = "Draw";
        if (winnersymbol === player1.symbol) winner=player1;
        else if (winnersymbol === player2.symbol) winner=player2;
        displayController.gameOver(winner);
        if (winner.name) winner.increaseScore();
    };

    const checkWinner = (values) => {
        let winner;
        //Check Rows
        const checkRow = (() => {
            for(let i=0; i<7; i +=3) {
                const row = [values[i],values[i+1],values[i+2]]; 
                if (row.every(v => v === row[0] && v !== null)) { //If all row items are the same and different than null
                    winner=row[0];
                };
            }
        })();
        if (winner) return winner;
        //Check Columns
        const checkColumn = (() => {
            for(let i=0; i<3; i++) {
                const column = [values[i],values[i+3],values[i+6]];
                if (column.every(v => v === column[0] && v !== null)) { //If all column items are the same and different than null
                    winner=column[0];
                };
            }
        })();
        if (winner) return winner;
        //Check Diagonals
        const checkDiagonal = (() => {
            for(let i=0; i<3; i +=2) {
                const diagonal = [values[i],values[4],values[8-i]];
                if (diagonal.every(v => v === diagonal[0] && v !== null)) { //If all diagonal items are the same and different than null
                    winner=diagonal[0];
                };
            }
        })();
        if (winner) return winner;
        if (values.filter(e => e !== null).length === 9) return "Draw";
    };
    
    const reset = () => {
        if (player1.name) {
            gameBoard.clear();
            displayController.clear();
            AI.stopTimer();
            gameOver=false;
            turn = Math.random() >= 0.5; //Random start
            displayController.changeTurn(turn);
        }
    };

    return {start,play,choice,reset,checkWinner}
})();

//---------------------- AI --------------------
const AI = (() => {
    let _timer;
    const play = (player) => {
        _timer = (game.difficulty==="easy") ? setTimeout(()=> {playRandom(player)}, 1500) : setTimeout(()=> {playSmart(player)}, 0);
    };

    const stopTimer = () => {
        clearTimeout(_timer);
    }

    const getOptions = (game) => {
        const options = [];
        for(let i=0; i<9; i++) { 
            if (game[i] === null)
            options.push(i);
        }
        return options
    }

    const playRandom = (player) => {
        const gameboard = gameBoard.display(); //Gets the gameboard array
        const options = getOptions(gameboard);
        const random = Math.floor(options.length*Math.random());
        const choice = options[random]; //Selects the value
        let cell = document.getElementById(choice); //Gets the html element which has the ID of our choice
        game.play(player,cell);
    };

    const playSmart = (player) => {
        const currentgameboard = gameBoard.display(); //Gets the gameboard array
        
        const options = getOptions(currentgameboard); //Makes an array listing all possible solutions where he can place his symbol
        if (options.length === 9) return playRandom(player); //If start of game choose random
        else {
            const choice = minimax(currentgameboard,player);
            let cell = document.getElementById(choice.position); //Gets the html element which has the ID of our choice
            game.play(player,cell);
        }
    };

    const minimax = (current,player) => {
        const max_player = player2; //The player who wants to have max score is the AI
        const other_player = (player.symbol===player2.symbol) ? player1 : player2; //If player is AI other player is player1, if player is player1 other player is AI (player2)

        //Get possible options and empty squares
        const options = getOptions(current);
        const emptysquares = options.length;

        //Check if previous move was winner
        let winnersymbol = game.checkWinner(current);
        if (winnersymbol === other_player.symbol) {
            if (other_player === max_player) {
                return {position: null,score: 1*(emptysquares+1)};
            } else return {position: null,score: -1*(emptysquares+1)};
        } else if (emptysquares === 0) return {position: null,score: 0};
        
        let best;
        if (player === player2) best = {position: null,score: -Infinity}; //each score should maximize
        else best = {position: null,score: +Infinity} //each score should minimize
        

        options.forEach(e => {
            current[e] = player.symbol; //Assigns to that position the current player symbol
            let sim_score = minimax(current,other_player); //For each option available it runs minimax again simulating the other player play, this cycle will repeat itself

            //Undo moves
            current[e] = null;
            winnersymbol = null;
            sim_score.position = e; //Assign to the sim_score the position ID that gave that score

            if (player === max_player) {
                if (sim_score.score > best.score) {  //Choose the maximum score if current player is is AI
                    best = sim_score;
                }
            } else {
                if (sim_score.score < best.score) { //Choose the minimum score if current player is not AI
                    best = sim_score;
                }
            }
        });
        return best; //Return the best score
    };

    return {play,stopTimer};
})();