function createPlayer(type, mark) {
    const Player = (function() {
        const _type = type;
        const _mark = mark;

        function getMark() {
            return _mark;
        };

        function getType() {
            return _type;
        };

        return {
            getMark,
            getType,
        };
    })();

    return Player;
};

function createGameBoard() {
    const Gameboard = (function() {
        const _initialCellContents = [...Array(3)].map(e => Array(3).fill(''));
    
        let _cellContents = _initialCellContents;
    
        function reset() {
            _cellContents = _initialCellContents;
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

function createGame(playerOne, playerTwo) {
    const Game = (function() {
        const _gameboard = createGameBoard();
        let _isGameOver = false;
        let _activePlayer = playerOne;

        function _switchActivePlayer() {
            _activePlayer = _activePlayer == playerOne ? playerTwo : playerOne;
        };

        function _getPossibleWinContents() {
            let results = [];
            for (let i = 0; i <= 2; i++) {
                results.push(_gameboard.getRowContent(i));
                results.push(_gameboard.getColumnContent(i));
            };
            results.push(_gameboard.getMainDiagonalContent());
            results.push(_gameboard.getMinorDiagonalContent());
            return results;
        };

        function _checkPossibleWin(possibleWin) {
            return possibleWin.every(cellContent => {
                return cellContent == _activePlayer.getMark();
            });
        };

        function _checkGameOver() {
            const possibleWinContents = _getPossibleWinContents();
            possibleWinContents.forEach(possibleWin => {
                if (_checkPossibleWin(possibleWin)) {
                    _isGameOver = true;
                    return;
                };
            });
        };
        
        function playTurn(row, column) {
            if (!!_gameboard.getCellContent(row, column)) {
                return; // Some kind of error message?
            };
            _gameboard.setCellContent(_activePlayer.getMark(), row, column);
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


function createDisplayController() {
    const DisplayController = (function() {
        // Add UI content and rendering functions
        return {
            
        };
    })();

    return DisplayController;
};

const GameController = (function() { 
    const _displayController = createDisplayController();
    
    // Have a click trigger this creation?
    // const _playerOne = createPlayer(playerOneType, 'X');
    // const _playerTwo = createPlayer(playerTwoType, 'O');
    // const _game = createGame(_playerOne, _playerTwo, _gameboard)

    return {

    }
})();




