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
        cell.addEventListener("click", () => game.play(cell)); //Event listener hover on div
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
        //Append title and symbol to gameover div
        choose.appendChild(title);
        choose.appendChild(input);
        choose.appendChild(donebutton);
        //Append div to gameboard;
        document.getElementById("main").appendChild(choose);
        donebutton.addEventListener("click", () => {if (input.value) {player1.name = input.value; choose.remove(); startGame(); game.start()}});
    })();

    return {update,clear,gameOver,changeTurn,updateScore}
})();

//-------------------------------------- Game logic ---------------------------------------------------
const gameBoard = (() => { //Current gameboard values
    const _gameBoard = [null,null,null,null,null,null,null,null,null];
    
    const changeValue = (symbol,position) => { //Changes value of that gameBoard position to the player symbol
        if (!_gameBoard[position.id]) { //Only change the value if that gameboard position is null
            _gameBoard[position.id] = symbol;
            displayController.update(symbol,position);
        }
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

    const play = (position) => {
        let winnersymbol;
        if (!gameOver) {
            let player;
            turn ? player = player1 : player = player2;
            gameBoard.changeValue(player.symbol,position);
            turn = !turn;
            displayController.changeTurn(turn);
            playCount++;
            if(playCount >= 5) { //Only start checking Winner after 5th play, before then there can be none
                winnersymbol = checkWinner();
                if (winnersymbol) endGame(winnersymbol);
            }
        }
    };
    
    const endGame = (winnersymbol) => {
        gameOver = true;
        let winner = "Draw";
        if (winnersymbol === player1.symbol) winner=player1;
        else if (winnersymbol === player2.symbol) winner=player2;
        displayController.gameOver(winner);
        if (winner.name) winner.increaseScore();
    };

    const checkWinner = () => {
        const values = gameBoard.display();
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
            gameOver=false;
            turn = Math.random() >= 0.5; //Random start
            displayController.changeTurn(turn);
        }
    };

    return {start,play,reset}
})();