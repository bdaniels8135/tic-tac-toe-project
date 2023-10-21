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
        };
        
        function playTurn(row, column) {
            if (!!gameboard.getCellContent(row, column)) {
                return; // Some kind of error message?
            };
            gameboard.setCellContent(_activePlayer.getMark(), row, column);
            _checkGameOver();
            _switchActivePlayer();
        };

        function getIsGameOver() {
            return _isGameOver;
        };

        function getActivePlayer() {
            return _activePlayer;
        };

        return {
            playTurn,
            getIsGameOver,
            getActivePlayer,
        };
    })();

    return Game;
}


function createDisplayController(gameboard) {
    const DisplayController = (function() {
        const _UI = {
            X_BTN: document.getElementById('x-mark'),
            O_BTN: document.getElementById('o-mark'),
            DUMB_AI_BTN: document.getElementById('dumb-opponent'),
            MASTER_AI_BTN: document.getElementById('smart-opponent'),
            HUMAN_BTN: document.getElementById('human-opponent'),
            GAME_CONTAINER: document.getElementById('game-container'), 
        };
        
        let _selectedMark = null;
        let _selectedOpponent = null;

        function _resolveMarkBtnClick(event) {
            _UI.X_BTN.classList.remove('selected');
            _UI.O_BTN.classList.remove('selected');
            event.target.classList.add('selected');

            console.log(event.target.id)
        };

        function _resolveOpponentBtnClick(event) {
            _UI.DUMB_AI_BTN.classList.remove('selected');
            _UI.MASTER_AI_BTN.classList.remove('selected');
            _UI.HUMAN_BTN.classList.remove('selected');
            event.currentTarget.classList.add('selected');

            console.log(event.currentTarget.id)
        };

        function _resolveGameCellClick(event) {
            console.log(event.target.id)
        };

        _UI.X_BTN.addEventListener('click', _resolveMarkBtnClick);
        _UI.O_BTN.addEventListener('click', _resolveMarkBtnClick);
        _UI.DUMB_AI_BTN.addEventListener('click', _resolveOpponentBtnClick);
        _UI.MASTER_AI_BTN.addEventListener('click', _resolveOpponentBtnClick);
        _UI.HUMAN_BTN.addEventListener('click', _resolveOpponentBtnClick);

        function renderGameGrid() {
            let gameRow;
            let gameCell;
            for (i = 0; i <= 2; i++) {
                gameRow = document.createElement('div');
                gameRow.classList.add('game-row')
                _UI.GAME_CONTAINER.appendChild(gameRow);
                for (let j = 0; j <= 2; j++) {
                    gameCell = document.createElement('div');
                    gameCell.classList.add('game-cell')
                    gameCell.id = `game-cell-${i}${j}`
                    gameCell.innerHTML = gameboard.getCellContent(i, j);
                    gameCell.addEventListener('click', _resolveGameCellClick);
                    gameRow.appendChild(gameCell);
                };
            };
        };

        // Add Win announcement and resign/new game button

        return {
            renderGameGrid,
        };
    })();

    return DisplayController;
};

const GameController = (function() { 
    const _gameboard = createGameboard(); 
    const _DISPLAY_CONTROLLER = createDisplayController(_gameboard);
    _DISPLAY_CONTROLLER.renderGameGrid();



    // Have a click trigger this creation?
    // const _playerOne = createPlayer(playerOneType, 'X');
    // const _playerTwo = createPlayer(playerTwoType, 'O');
    // const _game = createGame(_playerOne, _playerTwo, _gameboard)

    return {
        
    };
})();