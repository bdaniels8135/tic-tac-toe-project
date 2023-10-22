function createPlayer(type, mark) {
    const Player = (function() {
        const _TYPE = type;
        const _MARK = mark;

        function getMark() {
            return _MARK;
        };

        function getType() {
            return _TYPE;
        };

        return {
            getMark,
            getType,
        };
    })();

    return Player;
};

function createGameboard() {
    const Gameboard = (function() {
        const _INITIAL_CELL_CONTENTS = [...Array(3)].map(e => Array(3).fill(null));
    
        let _cellContents = _INITIAL_CELL_CONTENTS;
    
        function reset() {
            _cellContents = _INITIAL_CELL_CONTENTS;
        };
    
        function setCellContent(mark, rowIndex, columnIndex) {
            _cellContents[rowIndex][columnIndex] = mark;
        };

        function getCellContent(rowIndex, columnIndex) {
            return _cellContents[rowIndex][columnIndex];
        };
    
        function getRowContent(rowIndex) {
            return _cellContents[rowIndex];
        };

        function getColumnContent(colIndex) {
            return _cellContents.map(row => row[colIndex]);
        };

        function getMainDiagonalContent() {
            return _cellContents.map(row => row[_cellContents.indexOf(row)]);
        };

        function getMinorDiagonalContent() {
            return _cellContents.map(row => row[2 - _cellContents.indexOf(row)]);
        };

        return {
            setCellContent,
            getCellContent,
            getRowContent,
            getColumnContent,
            getMainDiagonalContent,
            getMinorDiagonalContent,            
            reset,
        };
    })();

    return Gameboard;
};

function createGame(playerOne, playerTwo, gameboard) {
    const Game = (function() {
        let _isGameOver = false;
        let _activePlayer = playerOne;
        let _turnCount = 0;

        function _switchActivePlayer() {
            _activePlayer = _activePlayer == playerOne ? playerTwo : playerOne;
        };

        function _getPossibleWinContents() {
            let results = [];
            for (let i = 0; i <= 2; i++) {
                results.push(gameboard.getRowContent(i));
                results.push(gameboard.getColumnContent(i));
            };
            results.push(gameboard.getMainDiagonalContent());
            results.push(gameboard.getMinorDiagonalContent());
            return results;
        };

        function _checkPossibleWin(possibleWin) {
            return possibleWin.every(cellContent => {
                return cellContent == _activePlayer.getMark();
            });
        };

        function _checkGameOver() {
            _getPossibleWinContents().forEach(possibleWin => {
                if (_checkPossibleWin(possibleWin)) {
                    _isGameOver = true;
                    return;
                };
            });
            if (_turnCount === 9) {
                _isGameOver = true;
            }
        };
        
        function checkLegalMove(rowIndex, colIndex) {
            return (!gameboard.getCellContent(rowIndex, colIndex))
        }

        function playTurn(rowIndex, colIndex) {
            gameboard.setCellContent(_activePlayer.getMark(), rowIndex, colIndex);
            _turnCount++;
            _checkGameOver();
            _switchActivePlayer();
            
        };

        function getIsGameOver() {
            return _isGameOver;
        };

        function getActivePlayer() {
            return _activePlayer;
        };

        function getTurnCount() {
            return _turnCount
        }

        return {
            checkLegalMove,
            playTurn,
            getIsGameOver,
            getActivePlayer,
            getTurnCount,
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
            GAME_CELLS: [],
        };
        
        (() => {
            for (i = 0; i <= 2; i++) {
                const NEW_GAME_ROW = document.createElement('div');
                NEW_GAME_ROW.classList.add('game-grid-row');
                UI.GAME_CONTAINER.appendChild(NEW_GAME_ROW);
                for (let j = 0; j <= 2; j++) {
                    const NEW_GAME_CELL = document.createElement('div');
                    NEW_GAME_CELL.classList.add('game-grid-cell');
                    NEW_GAME_CELL.id = `game-grid-cell-${i}${j}`;
                    UI.GAME_CELLS.push(NEW_GAME_CELL);
                    NEW_GAME_ROW.appendChild(NEW_GAME_CELL);
                };
            };
        })();

        function updateCellContents(mark, gameCell) {
            gameCell.innerHTML = mark;
        }

        function addSelectedStyle(element) {
            element.classList.add('selected');
        };

        function removeSelectedStyle(element) {
            element.classList.remove('selected');
        };

        // Add active player text/Win announcement and resign/new game button

        return {
            UI,
            addSelectedStyle,
            removeSelectedStyle,
            updateCellContents,
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

    function _endGame() {
        for (let gameCell of _DISPLAY_CONTROLLER.UI.GAME_CELLS) {
            gameCell.removeEventListener('click', _resolveGameCellClick);
        };
        console.log("GAME OVER!");
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
                console.log(`It is ${_GAME.getActivePlayer().getMark()}'s turn.`);
            };
        };         
    };

    (() => {
        _DISPLAY_CONTROLLER.UI.X_BTN.addEventListener('click', _resolveMarkBtnClick);
        _DISPLAY_CONTROLLER.UI.O_BTN.addEventListener('click', _resolveMarkBtnClick);
        // _DISPLAY_CONTROLLER.UI.DUMB_AI_BTN.addEventListener('click', _resolveOpponentBtnClick);
        // _DISPLAY_CONTROLLER.UI.MASTER_AI_BTN.addEventListener('click', _resolveOpponentBtnClick);
        _DISPLAY_CONTROLLER.UI.HUMAN_BTN.addEventListener('click', _resolveOpponentBtnClick);
    })();    
    
    function _activateGame() {
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
        console.log("It is X's turn.");
    };

    // Add resign/new game functionality

    return {
        _DISPLAY_CONTROLLER
    };
})();