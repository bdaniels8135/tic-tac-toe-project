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
            if (_turnCount === 9) {
                returnValue = true;
            }
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

        return {
            UI,
            addSelectedStyle,
            removeSelectedStyle,
            updateCellContents,
            updateAnnouncementText,
        };
    })();

    return DisplayController;
};

const GameController = (function() { 
    const _GAMEBOARD = createGameboard(); 
    const _DISPLAY_CONTROLLER = createDisplayController();
    let _GAME = null;

    let _selectedMark = null;
    let _selectedOpponent = null;

    function _resolveMarkBtnClick(event) {
        _DISPLAY_CONTROLLER.removeSelectedStyle(_DISPLAY_CONTROLLER.UI.X_BTN);
        _DISPLAY_CONTROLLER.removeSelectedStyle(_DISPLAY_CONTROLLER.UI.O_BTN);
        _DISPLAY_CONTROLLER.addSelectedStyle(event.target);
        _selectedMark = event.target.id[0].toUpperCase();
        if (_selectedOpponent) {
            _activateGame();
        }
    };

    function _resolveOpponentBtnClick(event) {
        _DISPLAY_CONTROLLER.removeSelectedStyle(_DISPLAY_CONTROLLER.UI.DUMB_AI_BTN);
        _DISPLAY_CONTROLLER.removeSelectedStyle(_DISPLAY_CONTROLLER.UI.MASTER_AI_BTN);
        _DISPLAY_CONTROLLER.removeSelectedStyle(_DISPLAY_CONTROLLER.UI.HUMAN_BTN);
        _DISPLAY_CONTROLLER.addSelectedStyle(event.currentTarget);
        _selectedOpponent = event.currentTarget.id;
        if (_selectedMark) {
            _activateGame();
        }
    };

    function _resetGame() {
        window.location.reload();
    }
    function _endGame() {
        for (let gameCell of _DISPLAY_CONTROLLER.UI.GAME_CELLS) {
            gameCell.removeEventListener('click', _resolveGameCellClick);
        };
        const WINNER = _GAME.getWinnersMark() ? _GAME.getWinnersMark() : 'Nobody';
        _DISPLAY_CONTROLLER.updateAnnouncementText(`Game Over, ${WINNER} Won!`);
        _DISPLAY_CONTROLLER.UI.RESET_BTN.innerHTML = 'Reset Game';
    }

    function _resolveGameCellClick(event) {
        const CELL_ROW_INDEX = event.target.id.slice(-2, -1);
        const CELL_COL_INDEX = event.target.id.slice(-1);
        if (_GAME.checkLegalMove(CELL_ROW_INDEX, CELL_COL_INDEX)) {
            _GAME.playTurn(CELL_ROW_INDEX, CELL_COL_INDEX);
            _DISPLAY_CONTROLLER.updateCellContents(_GAMEBOARD.getCellContent(CELL_ROW_INDEX, CELL_COL_INDEX), event.target);
            if (_GAME.getIsGameOver()) {
                _endGame();
            } else {
                _DISPLAY_CONTROLLER.updateAnnouncementText(`It is ${_GAME.getActivePlayer().getMark()}'s turn.`);
            };
        };         
    };

    (() => {
        _DISPLAY_CONTROLLER.UI.RESET_BTN.addEventListener('click', _resetGame);
        _DISPLAY_CONTROLLER.UI.X_BTN.addEventListener('click', _resolveMarkBtnClick);
        _DISPLAY_CONTROLLER.UI.O_BTN.addEventListener('click', _resolveMarkBtnClick);
        // _DISPLAY_CONTROLLER.UI.DUMB_AI_BTN.addEventListener('click', _resolveOpponentBtnClick);
        // _DISPLAY_CONTROLLER.UI.MASTER_AI_BTN.addEventListener('click', _resolveOpponentBtnClick);
        _DISPLAY_CONTROLLER.UI.HUMAN_BTN.addEventListener('click', _resolveOpponentBtnClick);
    })();    
    
    function _activateGame() {
        _DISPLAY_CONTROLLER.UI.GAME_CONTAINER.style.setProperty('visibility', 'visible');
        _DISPLAY_CONTROLLER.UI.RESET_BTN.style.setProperty('visibility', 'visible');
        _DISPLAY_CONTROLLER.UI.X_BTN.removeEventListener('click', _resolveMarkBtnClick);
        _DISPLAY_CONTROLLER.UI.O_BTN.removeEventListener('click', _resolveMarkBtnClick);
        // _DISPLAY_CONTROLLER.UI.DUMB_AI_BTN.removeEventListener('click', _resolveOpponentBtnClick);
        // _DISPLAY_CONTROLLER.UI.MASTER_AI_BTN.removeEventListener('click', _resolveOpponentBtnClick);
        _DISPLAY_CONTROLLER.UI.HUMAN_BTN.removeEventListener('click', _resolveOpponentBtnClick);
        for (let gameCell of _DISPLAY_CONTROLLER.UI.GAME_CELLS) {
            gameCell.addEventListener('click', _resolveGameCellClick);
        };

        const PLAYER_ONE = createPlayer('human', 'X');
        const PLAYER_TWO = createPlayer('human', 'O');

        _GAME = createGame(PLAYER_ONE, PLAYER_TWO, _GAMEBOARD);
        _DISPLAY_CONTROLLER.updateAnnouncementText('X always goes first!');
    };
})();