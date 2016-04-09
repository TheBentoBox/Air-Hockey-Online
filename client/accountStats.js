function fillStats() {
	// grab element references
	var pctWinSpan = document.querySelector('#pctWin');
	var pctLossSpan = document.querySelector('#pctLoss');
	var winLossRatioSpan = document.querySelector('#winLossRatio');
	
	// only attempt calculation if they've played yet
	if (userdata.gamesPlayed > 0) {
		var pctWins = ((userdata.gamesWon / userdata.gamesPlayed) * 100) + "%";
		var pctLost = ((userdata.gamesLost / userdata.gamesPlayed) * 100) + "%";
		
		// catch if they've won all of their games
		if (userdata.gamesLost === 0) {
			var winLossRatio = "All  " + userdata.gamesPlayed + " games played won. Good job!";
		}
		else {
			var winLossRatio = (userdata.gamesWon / userdata.gamesLost) + " wins per 1 loss";
		}
	}
	else {
		pctWins = "No games played";
		pctLost = "No games played";
		winLossRatio = "No games played";
	}
	
	// fill them in
	pctWinSpan.innerHTML = pctWins;
	pctLossSpan.innerHTML = pctLost;
	winLossRatioSpan.innerHTML = winLossRatio;
}

window.addEventListener("load", fillStats);