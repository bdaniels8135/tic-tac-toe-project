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

        return {
            reset,
            setCellContent,
            getCellContent,
            getRowContent,
            getColumnContent,
            getMajorDiagonalContent,
            getMinorDiagonalContent,
        };
    })();

    return Gameboard;
};

function createGame(playerOne, playerTwo, gameboard) {
    const Game = (function() {
        let _isGameOver = false;
        let _activePlayer = playerOne;
        let _turnCount = 0;
        let _winnersMark = null;

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

        const _checkCellForActivePlayerMark = cellContent => cellContent === _activePlayer.getMark();

        const _checkWinDirectionContent = winDirection => winDirection.every(_checkCellForActivePlayerMark);

        const _checkGameOver = () => {
            let returnValue = false;            
            _getWinDirectionsContent().forEach(winDirection => {
                if (_checkWinDirectionContent(winDirection)) {
                    _winnersMark = winDirection[0];
                    returnValue = true;
                };
            });
            if (_turnCount === 9) returnValue = true;
            return returnValue;
        };

        const checkLegalMove = (rowIndex, colIndex) => !gameboard.getCellContent(rowIndex, colIndex);
        
        const playTurn = (rowIndex, colIndex) => {
            gameboard.setCellContent(_activePlayer.getMark(), rowIndex, colIndex);
            _turnCount++;
            _isGameOver = _checkGameOver();
            _switchActivePlayer();
        };

        const getIsGameOver = () => _isGameOver;

        const getActivePlayer = () => _activePlayer;

        const getWinnersMark = () => _winnersMark;

        return {
            checkLegalMove,
            playTurn,
            getIsGameOver,
            getActivePlayer,
            getWinnersMark,
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
            MASTER_AI_BTN: document.getElementById('smart-opponent'),
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

        const updateCellContents = (mark, gameCell) => {gameCell.innerHTML = mark};

        const addSelectedStyle = element => {element.classList.add('selected')};

        const removeSelectedStyle = element => {element.classList.remove('selected')};

        const updateAnnouncementText = newText => {UI.ANNOUNCEMENT_BOX.innerHTML = newText};

        const getMarkBtnMark = btn => btn.id[0].toUpperCase();

        const getCellRowIndex = cell => cell.id.slice(-2, -1);

        const getCellColIndex = cell => cell.id.slice(-1);

        return {
            UI,
            addSelectedStyle,
            removeSelectedStyle,
            updateCellContents,
            updateAnnouncementText,
            getMarkBtnMark,
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
        _selectedMark = _DC.getMarkBtnMark(event.target);
        if (_selectedOpponent) _activateGame();
    };

    const _resolveOpponentBtnClick = event => {
        _DC.removeSelectedStyle(_DC.UI.DUMB_AI_BTN);
        _DC.removeSelectedStyle(_DC.UI.MASTER_AI_BTN);
        _DC.removeSelectedStyle(_DC.UI.HUMAN_BTN);
        _DC.addSelectedStyle(event.currentTarget);
        _selectedOpponent = event.currentTarget.id;
        if (_selectedMark) _activateGame();
    };

    const _resetGame = () => {window.location.reload()};
    
    const _endGame = () => {
        _DC.UI.GAME_CELLS.forEach(gameCell => gameCell.removeEventListener('click', _resolveGameCellClick));
        const WINNER = _GAME.getWinnersMark() ? _GAME.getWinnersMark() : 'Nobody';
        _DC.updateAnnouncementText(`Game Over, ${WINNER} Won!`);
        _DC.UI.RESET_BTN.innerHTML = 'Reset';
    };

    const _resolveGameCellClick = event => {
        const cellRowIndex = _DC.getCellRowIndex(event.target);
        const cellColIndex = _DC.getCellColIndex(event.target);
        if (_GAME.checkLegalMove(cellRowIndex, cellColIndex)) {
            _GAME.playTurn(cellRowIndex, cellColIndex);
            _DC.updateCellContents(_GB.getCellContent(cellRowIndex, cellColIndex), event.target);
            if (_GAME.getIsGameOver()) _endGame();
            else _DC.updateAnnouncementText(`It is ${_GAME.getActivePlayer().getMark()}'s turn.`);
        };
    };

    _DC.UI.RESET_BTN.addEventListener('click', _resetGame);
    _DC.UI.X_BTN.addEventListener('click', _resolveMarkBtnClick);
    _DC.UI.O_BTN.addEventListener('click', _resolveMarkBtnClick);
    // _DC.UI.DUMB_AI_BTN.addEventListener('click', _resolveOpponentBtnClick);
    // _DC.UI.MASTER_AI_BTN.addEventListener('click', _resolveOpponentBtnClick);
    _DC.UI.HUMAN_BTN.addEventListener('click', _resolveOpponentBtnClick);

    const _activateGame = () => {
        _DC.UI.GAME_CONTAINER.style.setProperty('visibility', 'visible');
        _DC.UI.RESET_BTN.style.setProperty('visibility', 'visible');

        _DC.UI.X_BTN.removeEventListener('click', _resolveMarkBtnClick);
        _DC.UI.O_BTN.removeEventListener('click', _resolveMarkBtnClick);
        // _DC.UI.DUMB_AI_BTN.removeEventListener('click', _resolveOpponentBtnClick);
        // _DC.UI.MASTER_AI_BTN.removeEventListener('click', _resolveOpponentBtnClick);
        _DC.UI.HUMAN_BTN.removeEventListener('click', _resolveOpponentBtnClick);
        _DC.UI.GAME_CELLS.forEach(gameCell => gameCell.addEventListener('click', _resolveGameCellClick));

        const playerOne = createPlayer('human', 'X');
        const playerTwo = createPlayer('human', 'O');

        _GAME = createGame(playerOne, playerTwo, _GB);
        _DC.updateAnnouncementText('X always goes first!');
    };
})();