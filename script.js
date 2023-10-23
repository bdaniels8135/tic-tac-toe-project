function createPlayer(type, mark) {
    const Player = (function() {
        const _type = type;
        const _mark = mark;

        const getMark = () => _mark;
        
        const getType = () => _type;
        
        return {
            getMark,
            getType,
        };
    })();

    return Player;
};

function createGameboard() {
    const Gameboard = (function() {
        let _cellContents = [...Array(3)].map(e => Array(3).fill(null));
    
        const reset = () => {_cellContents = [...Array(3)].map(e => Array(3).fill(null))};
        
        const setCellContent = (mark, rowIndex, colIndex) => {_cellContents[rowIndex][colIndex] = mark};

        const getCellContent = (rowIndex, colIndex) => _cellContents[rowIndex][colIndex];

        const getRowContent = rowIndex => _cellContents[rowIndex];

        const getColumnContent = colIndex => _cellContents.map(row => row[colIndex]);
        
        const getMajorDiagonalContent = () => _cellContents.map(row => row[_cellContents.indexOf(row)]);
        
        const getMinorDiagonalContent = () => _cellContents.map(row => row[2 - _cellContents.indexOf(row)]);

        const getEmptyCellIndices = () => {
            const emptyCellIndices = []
            for (let i = 0; i <= 2; i++) {
                for (let j = 0; j <= 2; j++) {
                    if (!getCellContent(i, j)) emptyCellIndices.push([i, j]);
                };
            };
            return emptyCellIndices;
        };
        
        return {
            reset,
            setCellContent,
            getCellContent,
            getRowContent,
            getColumnContent,
            getMajorDiagonalContent,
            getMinorDiagonalContent,
            getEmptyCellIndices,
        };
    })();

    return Gameboard;
};

function createGame(playerOne, playerTwo, gameboard) {
    const Game = (function() {
        let _activePlayer = playerOne;
        let _turnCount = 0;

        const _switchActivePlayer = () => {_activePlayer = _activePlayer === playerOne ? playerTwo : playerOne};

        const _getWinDirectionsContent = () => {
            const winDirectionContents = [];
            for (let i = 0; i <= 2; i++) {
                winDirectionContents.push(gameboard.getRowContent(i));
                winDirectionContents.push(gameboard.getColumnContent(i));
            };
            winDirectionContents.push(gameboard.getMajorDiagonalContent());
            winDirectionContents.push(gameboard.getMinorDiagonalContent());
            return winDirectionContents;
        };

        const _checkWinDirectionContent = winDirection => winDirection.every(cell => cell === 'X') || winDirection.every(cell => cell === 'O');

        const checkGameOver = () => {
            let returnValue = [false, null];            
            _getWinDirectionsContent().forEach(winDirection => {
                if (_checkWinDirectionContent(winDirection)) returnValue = [true, winDirection[0]];
            });
            if (_turnCount === 9) returnValue = [true, null];
            return returnValue;
        };

        const checkLegalMove = (rowIndex, colIndex) => !gameboard.getCellContent(rowIndex, colIndex);
        
        const playTurn = (rowIndex, colIndex) => {
            gameboard.setCellContent(_activePlayer.getMark(), rowIndex, colIndex);
            _turnCount++;
            _switchActivePlayer();
        };

        const getActivePlayer = () => _activePlayer;

        return {
            checkLegalMove,
            playTurn,
            checkGameOver,
            getActivePlayer,
        };
    })();

    return Game;
}

function createDisplayController() {
    const DisplayController = (function() {
        const UI = {
            X_BTN: document.getElementById('x-mark'),
            O_BTN: document.getElementById('o-mark'),
            DUMB_AI_BTN: document.getElementById('dumb-opponent'),
            MASTER_AI_BTN: document.getElementById('master-opponent'),
            HUMAN_BTN: document.getElementById('human-opponent'),
            GAME_CONTAINER: document.getElementById('game-container'),
            ANNOUNCEMENT_BOX: document.getElementById('game-announcement'),
            RESET_BTN: document.getElementById('reset-btn'),
            GAME_CELLS: [],
        };
                
        for (i = 0; i <= 2; i++) {
            const newGameRow = document.createElement('div');
            newGameRow.classList.add('game-row');
            UI.GAME_CONTAINER.appendChild(newGameRow);
            for (let j = 0; j <= 2; j++) {
                const newGameCell = document.createElement('div');
                newGameCell.classList.add('game-cell');
                newGameCell.id = `game-cell-${i}${j}`;
                UI.GAME_CELLS.push(newGameCell);
                newGameRow.appendChild(newGameCell);
            };
        };       

        const updateCellContent = (mark, rowIndex, colIndex) => {UI.GAME_CELLS[3 * rowIndex + colIndex].innerHTML = mark};

        const addSelectedStyle = element => {element.classList.add('selected')};

        const removeSelectedStyle = element => {element.classList.remove('selected')};

        const updateAnnouncementText = newText => {UI.ANNOUNCEMENT_BOX.innerHTML = newText};

        const getBtnPlayerMark = btn => btn.id[0].toUpperCase();

        const getBtnOpponentType = btn => btn.id.split('-')[0];

        const getCellRowIndex = cell => Number(cell.id.slice(-2, -1));

        const getCellColIndex = cell => Number(cell.id.slice(-1));

        return {
            UI,
            addSelectedStyle,
            removeSelectedStyle,
            updateCellContent,
            updateAnnouncementText,
            getBtnPlayerMark,
            getBtnOpponentType,
            getCellRowIndex,
            getCellColIndex,
        };
    })();

    return DisplayController;
};

const GameController = (function() { 
    const _GB = createGameboard(); 
    const _DC = createDisplayController();
    let _GAME = null;
    let _selectedMark = null;
    let _selectedOpponent = null;

    const _resolveMarkBtnClick = event => {
        _DC.removeSelectedStyle(_DC.UI.X_BTN);
        _DC.removeSelectedStyle(_DC.UI.O_BTN);
        _DC.addSelectedStyle(event.target);
        _selectedMark = _DC.getBtnPlayerMark(event.target);
        if (_selectedOpponent) _activateGame();
    };

    const _resolveOpponentBtnClick = event => {
        _DC.removeSelectedStyle(_DC.UI.DUMB_AI_BTN);
        _DC.removeSelectedStyle(_DC.UI.MASTER_AI_BTN);
        _DC.removeSelectedStyle(_DC.UI.HUMAN_BTN);
        _DC.addSelectedStyle(event.currentTarget);
        _selectedOpponent = _DC.getBtnOpponentType(event.currentTarget);
        if (_selectedMark) _activateGame();
    };

    const _resetGame = () => {window.location.reload()};
    
    const _endGame = (winnersMark) => {
        _DC.UI.GAME_CELLS.forEach(gameCell => gameCell.removeEventListener('click', _resolveGameCellClick));
        _DC.updateAnnouncementText(`Game Over, ${winnersMark} Won!`);
        _DC.UI.RESET_BTN.innerHTML = 'Reset';
    };

    const _resolveGameCellClick = event => {
        const cellRowIndex = _DC.getCellRowIndex(event.target);
        const cellColIndex = _DC.getCellColIndex(event.target);
        if (_GAME.checkLegalMove(cellRowIndex, cellColIndex)) {
            _GAME.playTurn(cellRowIndex, cellColIndex);
            _DC.updateCellContent(_GB.getCellContent(cellRowIndex, cellColIndex), cellRowIndex, cellColIndex);
            const [isGameOver, winnersMark] = _GAME.checkGameOver();
            if (isGameOver) _endGame(winnersMark);
            else if (_GAME.getActivePlayer().getType() === 'human') _DC.updateAnnouncementText(`It is ${_GAME.getActivePlayer().getMark()}'s turn.`);
            else if (_GAME.getActivePlayer().getType() === 'dumb') _takeDumbTurn();
            else if (_GAME.getActivePlayer().getType() === 'master') _takeMaterTurn();
        };
    };

    _DC.UI.RESET_BTN.addEventListener('click', _resetGame);
    _DC.UI.X_BTN.addEventListener('click', _resolveMarkBtnClick);
    _DC.UI.O_BTN.addEventListener('click', _resolveMarkBtnClick);
    _DC.UI.DUMB_AI_BTN.addEventListener('click', _resolveOpponentBtnClick);
    _DC.UI.MASTER_AI_BTN.addEventListener('click', _resolveOpponentBtnClick);
    _DC.UI.HUMAN_BTN.addEventListener('click', _resolveOpponentBtnClick);

    const _activateGame = () => {
        _DC.UI.GAME_CONTAINER.style.setProperty('visibility', 'visible');
        _DC.UI.RESET_BTN.style.setProperty('visibility', 'visible');

        _DC.UI.X_BTN.removeEventListener('click', _resolveMarkBtnClick);
        _DC.UI.O_BTN.removeEventListener('click', _resolveMarkBtnClick);
        _DC.UI.DUMB_AI_BTN.removeEventListener('click', _resolveOpponentBtnClick);
        _DC.UI.MASTER_AI_BTN.removeEventListener('click', _resolveOpponentBtnClick);
        _DC.UI.HUMAN_BTN.removeEventListener('click', _resolveOpponentBtnClick);
        _DC.UI.GAME_CELLS.forEach(gameCell => gameCell.addEventListener('click', _resolveGameCellClick));

        const playerOneType = _selectedMark === 'X' ? 'human' : (_selectedOpponent === 'human' ? 'human' : _selectedOpponent);
        const playerTwoType = _selectedMark === 'O' ? 'human' : (_selectedOpponent === 'human' ? 'human' : _selectedOpponent);

        const playerOne = createPlayer(playerOneType, 'X');
        const playerTwo = createPlayer(playerTwoType, 'O');

        _GAME = createGame(playerOne, playerTwo, _GB);

        if (playerOneType === 'dumb') _takeDumbTurn();
        else _DC.updateAnnouncementText('X always goes first!');
    };

    const _takeDumbTurn = () => {
        const [cellRowIndex, cellColIndex] = _GB.getEmptyCellIndices()[0];
        _GAME.playTurn(cellRowIndex, cellColIndex);
        _DC.updateCellContent(_GB.getCellContent(cellRowIndex, cellColIndex), cellRowIndex, cellColIndex);
        const [isGameOver, winnersMark] =_GAME.checkGameOver();
        if (isGameOver) _endGame(winnersMark);
        else _DC.updateAnnouncementText(`It is ${_GAME.getActivePlayer().getMark()}'s turn.`);
    };

    const _takeMaterTurn = () => {
        _DC.updateAnnouncementText('The AI is thinking...');
    };

    // const _getBestMove = (gameboard, depth=0) => {
    //     if (_GAME.checkGameOver()[0]) {
    //         if (_GAME.getWinnersMark() === _GAME.getActivePlayer().getMark())
    //     }
      


    //     depth++;
    //     return bestMove;
    // }

    // return {
    //     _getBestMove
    // }
})();





const testGameboard = [['O', null, 'X'], ['X', null, 'X'], [null, 'O', 'O']]