
window.onload = function () {
    let board = document.getElementById('board');
    let guessButton = this.document.getElementById('guessButton');
    let guessInput = this.document.getElementById('guessInput');

    for (let i = 0; i < 6; i++) {
        let row = this.document.createElement('div');
        row.classList.add('row');
        board.append(row);

        for (let j = 0; j < 5; j++) {
            let cell = this.document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-column', j);
            row.append(cell);
        }
    }
//1.randomize target word
    const words=["plant","chair","films","cloud","plans",
                "house","mango","apple","fruit","horse"];
    let word = words[Math.floor(Math.random()*words.length)];
    let tries = 0;
    let gameOver = false;

    guessButton.addEventListener('click', function () {
        if (gameOver == true)
        {
            alert("Game is already over");
            return;
        }

        //2.add input validation
        let guess = guessInput.value;

        if(guess.length!==5){
            alert("the guess must be exactly 5 letters");
            return;
        }

        //8.enhanced color feedback logic
        let letterCount = {}; 
        
        // Count letters in the target word 
        for (let char of word) {
             letterCount[char] = (letterCount[char] || 0) + 1; 
        }

        // First pass: mark greens 
        let result = Array(5).fill("red"); 
        for (let i = 0; i < 5; i++) { 
            if (guess[i] === word[i]) { 
                result[i] = "green"; 
                letterCount[guess[i]]--; 
            } 
        }
        // Second pass: mark yellows 
        for (let i = 0; i < 5; i++) { 
            if (result[i] === "green") continue; 
            if (letterCount[guess[i]] > 0) { 
                result[i] = "yellow"; 
                letterCount[guess[i]]--; 
            } 
        }
        // Apply colors to cells 
        for (let i = 0; i < 5; i++) { 
            let currentCell = document.querySelector( 
                `[data-row="${tries}"][data-column="${i}"]` 
            ); 
            currentCell.textContent = guess[i]; 
            currentCell.classList.add(result[i]); 
        }

        if (word == guess)
        {
            alert("You won");
            gameOver = true;
            // guessButton.setAttribute('disabled', 'disabled');
            return;
        };
        if (tries == 5)
        {
            //6.display the corect word or loss
            alert("You lostThe word was: " + word.toUpperCase());
            gameOver = true;
            newGameBtn.style.display = "block";
            return;
        }

        tries++;
    })
    //4.add new game button
    let newGameBtn = document.getElementById('newGameBtn');
    function startGame() {
    // reset board HTML
    board.innerHTML = "";

    // reset tries and gameOver
    tries = 0;
    gameOver = false;

    // choose new word
    word = words[Math.floor(Math.random() * words.length)];

    // hide new game button
    newGameBtn.style.display = "none";

    // rebuild board
    for (let i = 0; i < 6; i++) {
        let row = document.createElement('div');
        row.classList.add('row');
        board.append(row);

        for (let j = 0; j < 5; j++) {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-column', j);
            row.append(cell);
        }
    }

    // clear input
    guessInput.value = "";
}
window.onload = function () {
    //get elements
    startGame();
};
if (word == guess) {
    alert("You won");
    gameOver = true;
    newGameBtn.style.display = "block";
    return;
}

if (tries == 5) {
    alert("You lost");
    gameOver = true;
    newGameBtn.style.display = "block";
    return;
}
newGameBtn.addEventListener('click', startGame);


//5. implement keyboard suport
guessInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        // simulate button click
        guessButton.click();
    }
});

function handleGuess() {
    // existing click logic
}

guessButton.addEventListener('click', handleGuess);

guessInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        handleGuess();
    }
});


//7.add animation
let currentCell = document.querySelector(
    `[data-row="${tries}"][data-column="${i}"]`
);
currentCell.textContent = guess[i];

// Add flip effect with small delay per cell
setTimeout(() => {
    currentCell.classList.add('flip');

    setTimeout(() => {
        // After mid-flip, add color
        if (guess[i] == word[i]) {
            currentCell.classList.add('green');
        } else if (word.indexOf(guess[i]) < 0) {
            currentCell.classList.add('red');
        } else {
            currentCell.classList.add('yellow');
        }

        // remove flip to "flip back"
        currentCell.classList.remove('flip');
    }, 150);
}, i * 200);


}
