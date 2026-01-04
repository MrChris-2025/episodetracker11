// --- NFL Team Logos and Schedule Data ---

const nflTeamLogos = {
    "NY Jets": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/New_York_Jets_logo.svg/60px-New_York_Jets_logo.svg.png",
    "Seattle Seahawks": "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Seattle_Seahawks_logo.svg/60px-Seattle_Seahawks_logo.svg.png",
    "New England Patriots": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/New_England_Patriots_logo.svg/60px-New_England_Patriots_logo.svg.png",
    "Minnesota Vikings": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Minnesota_Vikings_logo.svg/60px-Minnesota_Vikings_logo.svg.png",
    "Cleveland Browns": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Cleveland_Browns_logo.svg/60px-Cleveland_Browns_logo.svg.png",
    "Cincinnati Bengals": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Cincinnati_Bengals_logo.svg/60px-Cincinnati_Bengals_logo.svg.png",
    "Green Bay Packers": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Green_Bay_Packers_logo.svg/60px-Green_Bay_Packers_logo.svg.png",
    "Indianapolis Colts": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Indianapolis_Colts_logo.svg/60px-Indianapolis_Colts_logo.svg.png",
    "Los Angeles Chargers": "https://upload.wikimedia.org/wikipedia/en/thumb/7/71/Los_Angeles_Chargers_logo.svg/60px-Los_Angeles_Chargers_logo.svg.png",
    "Chicago Bears": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Chicago_Bears_logo.svg/60px-Chicago_Bears_logo.svg.png",
    "Buffalo Bills": "https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Buffalo_Bills_logo.svg/60px-Buffalo_Bills_logo.svg.png",
    "Baltimore Ravens": "https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Baltimore_Ravens_logo.svg/60px-Baltimore_Ravens_logo.svg.png",
    "Miami Dolphins": "https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Miami_Dolphins_logo.svg/60px-Miami_Dolphins_logo.svg.png",
    "Detroit Lions": "https://upload.wikimedia.org/wikipedia/en/thumb/7/71/Detroit_Lions_logo.svg/60px-Detroit_Lions_logo.svg.png",
    "Pittsburgh Steelers": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pittsburgh_Steelers_logo.svg/60px-Pittsburgh_Steelers_logo.svg.png"
};

const steelersSchedule = [
    { game: "Week 1: Sep 7 @ NY Jets (1:00 PM ET)", channel: "CBS" },
    { game: "Week 2: Sep 14 vs Seattle Seahawks (1:00 PM ET)", channel: "FOX" },
    { game: "Week 3: Sep 21 @ New England Patriots (1:00 PM ET)", channel: "CBS" },
    { game: "Week 4: Sep 28 vs Minnesota Vikings (in Dublin) (9:30 AM ET)", channel: "NFLN" },
    { game: "Week 5: BYE", channel: "" },
    { game: "Week 6: Oct 12 vs Cleveland Browns (1:00 PM ET)", channel: "FOX" },
    { game: "Week 7: Oct 16 @ Cincinnati Bengals (8:15 PM ET)", channel: "Prime Video" },
    { game: "Week 8: Oct 26 vs Green Bay Packers (8:20 PM ET)", channel: "NBC" },
    { game: "Week 9: Nov 2 vs Indianapolis Colts (1:00 PM ET)", channel: "CBS" },
    { game: "Week 10: Nov 9 @ Los Angeles Chargers (8:20 PM ET)", channel: "NBC" },
    { game: "Week 11: Nov 16 vs Cincinnati Bengals (1:00 PM ET)", channel: "FOX" },
    { game: "Week 12: Nov 23 @ Chicago Bears (1:00 PM ET)", channel: "CBS" },
    { game: "Week 13: Nov 30 vs Buffalo Bills (4:25 PM ET)", channel: "CBS" },
    { game: "Week 14: Dec 7 @ Baltimore Ravens (1:00 PM ET)", channel: "FOX" },
    { game: "Week 15: Dec 15 vs Miami Dolphins (8:15 PM ET)", channel: "ESPN/ABC" },
    { game: "Week 16: Dec 21 @ Detroit Lions (4:25 PM ET)", channel: "FOX" },
    { game: "Week 17: Dec 28 @ Cleveland Browns (1:00 PM ET)", channel: "CBS" },
    { game: "Week 18: Jan 3/4 vs Baltimore Ravens (Time TBD ET)", channel: "TBD" }
];

// --- Next Game & Countdown Logic ---

let nextGame = null;

function getNextSteelersGame() {
    const now = new Date();
    // Regex to capture the Month, Day, and Time/Timezone
    const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{1,2})\s.*?\(([\d\:]+\s(?:AM|PM)\s(?:ET|EDT|EST))\)/;
    
    for (const gameItem of steelersSchedule) {
        if (gameItem.game.includes("BYE") || gameItem.game.includes("TBD")) continue;

        const match = gameItem.game.match(dateRegex);
        if (match) {
            const [fullMatch, month, day, timeAndZone] = match;
            
            // Note: The year must be inferred. Since the schedule spans late 2025/early 2026, 
            // a basic check on the month relative to 'now' is used to set the year to 2025 or 2026.
            let year = now.getFullYear();
            const gameMonth = new Date(Date.parse(month + " 1, " + year)).getMonth();
            const currentMonth = now.getMonth();

            // If the current month is late in the year (e.g., Nov/Dec) and the game is early (e.g., Jan), increment the year.
            if (currentMonth >= 10 && gameMonth <= 1) { // 10 is Nov, 1 is Feb
                year++;
            }
            
            const dateString = `${month} ${day}, ${year} ${timeAndZone.replace(' ET', ' EST').replace(' EDT', ' EST')}`; // Use EST as a fallback for the system to parse
            const gameDate = new Date(dateString);

            if (gameDate.getTime() > now.getTime()) {
                
                // Extract opponent for display
                let opponentMatch = gameItem.game.match(/(?:@|vs)\s(.*?)(?:\s\(|$)/);
                let opponent = opponentMatch ? opponentMatch[1].trim() : 'The Next Game';
                
                // Remove team name from game string to prevent re-matching in the ticker
                const teamNamesRegex = new RegExp(Object.keys(nflTeamLogos).join('|'), 'g');
                const cleanGame = gameItem.game.replace(teamNamesRegex, '');
                
                return {
                    kickoffTime: gameDate.getTime(),
                    opponent: opponent,
                    fullGameText: gameItem.game
                };
            }
        }
    }
    return null; // All games have passed or schedule is incomplete
}

nextGame = getNextSteelersGame();
let kickoffDate = nextGame ? nextGame.kickoffTime : new Date().getTime(); // Set to current time if no game found

const countdownFunction = setInterval(function() {
    const now = new Date().getTime();
    const distance = kickoffDate - now;

    const countdownElement = document.getElementById("nflCountdown");
    if (!countdownElement) {
        clearInterval(countdownFunction);
        return;
    }

    if (distance < 0 && nextGame) {
        clearInterval(countdownFunction);
        countdownElement.innerHTML = `KICKOFF! ${nextGame.opponent} has started.`;
    } else if (distance < 0 && !nextGame) {
         clearInterval(countdownFunction);
        countdownElement.innerHTML = "Season complete or no games scheduled.";
    } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const opponentText = nextGame ? ` vs ${nextGame.opponent}` : 'Next Game';
        
        countdownElement.innerHTML = `Next:${opponentText} ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
}, 1000);

// --- Steelers Ticker Function ---

function updateSteelersTicker() {
    const steelersTickerElement = document.getElementById("steelersScheduleTicker");
    if (!steelersTickerElement) return;

    let fullScheduleHtml = '';
    const separator = ' &nbsp; &nbsp; <span style="color: #606060;">&bull;</span> &nbsp; &nbsp; ';

    steelersSchedule.forEach(item => {
        let displayGameText = item.game;
        const channel = item.channel;
        // Construct a regex to find and replace team names with logo image and name
        const teamNamesRegex = new RegExp(Object.keys(nflTeamLogos).join('|'), 'g');
        displayGameText = displayGameText.replace(teamNamesRegex, (match) => {
            const logoUrl = nflTeamLogos[match];
            return logoUrl ? `<img src="${logoUrl}" alt="${match} logo">${match}` : match;
        });
        let channelInfo = channel ? `<span class="steelers-ticker-channel">(${channel})</span>` : '';
        fullScheduleHtml += `<span>${displayGameText} ${channelInfo}</span>${separator}`;
    });

    // Duplicate the content for smooth, infinite-looking scroll
    const content = fullScheduleHtml + fullScheduleHtml;
    steelersTickerElement.innerHTML = content;

    const tickerContainer = document.querySelector('.steelers-ticker-container');
    if (tickerContainer) {
        tickerContainer.style.visibility = 'visible';
    }
}
document.addEventListener('DOMContentLoaded', updateSteelersTicker);

// --- Alpine.js Data Object (sportsApp) ---

function sportsApp() {
    return {
        sports: [],
        matches: [],
        filteredMatches: [],
        allAvailableStreams: [],
        selectedSport: '',
        matchType: 'live',
        mobileMenu: false,
        currentEmbeddedStreamUrl: null,
        selectedMatchTitle: '',
        selectedMatchId: null,
        selectedMatchBadges: { home: null, away: null },
        showSteelersSchedule: true,
        loadingMatches: true,
        currentStreamIndex: 0,
        currentStream: null,
        isGridView: false,
        isMatchSelected: false,
        isFullScreen: false,

        async init() {
            this.showSteelersSchedule = true;
            await this.loadSports();
            await this.loadMatches();
            // Fullscreen listeners for tracking state
            document.addEventListener('fullscreenchange', () => this.isFullScreen = !!document.fullscreenElement);
            document.addEventListener('webkitfullscreenchange', () => this.isFullScreen = !!document.webkitFullscreenElement);
            document.addEventListener('mozfullscreenchange', () => this.isFullScreen = !!document.mozFullScreenElement);
            document.addEventListener('msfullscreenchange', () => this.isFullScreen = !!document.msFullscreenElement);
        },
        async loadSports() {
            try {
                const response = await fetch('https://streamed.pk/api/sports');
                if (!response.ok) throw new Error('Network response was not ok.');
                const sportsData = await response.json();
                this.sports = sportsData.sort((a, b) => a.name.localeCompare(b.name));
            } catch (error) {
                console.error('Error loading sports:', error);
                this.sports = [];
            }
        },
        async loadMatches() {
            this.loadingMatches = true;
            let endpoint = this.matchType === 'today' ? '/api/matches/all-today' :
                           this.matchType === 'all' ? '/api/matches/all' :
                           `/api/matches/${this.matchType}`;

            try {
                const response = await fetch(`https://streamed.pk${endpoint}`);
                if (!response.ok) throw new Error('Network response was not ok.');
                this.matches = await response.json();
            } catch (error) {
                console.error('Error loading matches:', error);
                this.matches = [];
            } finally {
                this.loadingMatches = false;
                this.filterMatches();
            }
        },
        filterMatches() {
            this.filteredMatches = this.selectedSport
                ? this.matches.filter(match => match.category === this.selectedSport)
                : this.matches;
        },
        formatDate(timestamp) {
            return new Date(timestamp).toLocaleString('en-US', {
                timeZone: 'America/New_York',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
        },
        async handleWatchStream(match) {
            this.setPlayerTitle(match);
            this.setPlayerBadges(match);
            this.selectedMatchId = match.id;
            this.isMatchSelected = true;
            
            let streams = [];
            for (const source of match.sources) {
                try {
                    const response = await fetch(`https://streamed.pk/api/stream/${source.source}/${source.id}`);
                    if (!response.ok) throw new Error('Network response was not ok.');
                    const fetchedStreams = await response.json();
                    streams = [...streams, ...fetchedStreams];
                } catch (error) {
                    console.error(`Error loading stream for ${source.source}:`, error);
                }
            }

            this.allAvailableStreams = streams;
            if (streams.length === 0) {
                this.currentEmbeddedStreamUrl = null;
                this.selectedMatchTitle = "No streams found. Try a different match.";
                this.currentStreamIndex = 0;
                this.currentStream = null;
                this.isMatchSelected = false;
                return;
            }

            // Sort by HD quality (descending) then by stream number (ascending)
            streams.sort((a, b) => (b.hd - a.hd) || (a.streamNo - b.streamNo));
            this.currentStreamIndex = 0;
            this.currentStream = this.allAvailableStreams[this.currentStreamIndex];
            this.currentEmbeddedStreamUrl = this.currentStream.embedUrl;
            
            // Scroll to the player on mobile devices
            if (window.innerWidth < 768) {
                const mainPlayerSection = document.getElementById('main-player-section');
                if (mainPlayerSection) {
                    mainPlayerSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        },
        nextStream() {
            if (this.currentStreamIndex < this.allAvailableStreams.length - 1) {
                this.currentStreamIndex++;
                this.currentStream = this.allAvailableStreams[this.currentStreamIndex];
                this.currentEmbeddedStreamUrl = this.currentStream.embedUrl;
            }
        },
        previousStream() {
            if (this.currentStreamIndex > 0) {
                this.currentStreamIndex--;
                this.currentStream = this.allAvailableStreams[this.currentStreamIndex];
                this.currentEmbeddedStreamUrl = this.currentStream.embedUrl;
            }
        },
        loadTickerPlayer() {
            this.currentEmbeddedStreamUrl = 'https://heather2025.nekoweb.org/movie4/no-main/ticker/tickerall2.html';
            this.selectedMatchTitle = 'All Tickers';
            this.allAvailableStreams = [];
            this.selectedMatchId = null;
            this.currentStreamIndex = 0;
            this.currentStream = null;
            this.selectedMatchBadges = { home: null, away: null };
            this.isMatchSelected = false;
        },
        toggleSteelersSchedule() {
            this.showSteelersSchedule = !this.showSteelersSchedule;
        },
        setPlayerTitle(match) {
            this.selectedMatchTitle = match.teams ? `${match.teams.home.name} vs ${match.teams.away.name}` : match.title;
        },
        setPlayerBadges(match) {
            if (match.teams) {
                this.selectedMatchBadges.home = match.teams.home?.badge ? 'https://streamed.pk/api/images/badge/' + match.teams.home.badge + '.webp' : 'https://heather2025.nekoweb.org/images/beetle.jpg';
                this.selectedMatchBadges.away = match.teams.away?.badge ? 'https://streamed.su/api/images/badge/' + match.teams.away.badge + '.webp' : 'https://heather2025.nekoweb.org/images/beetle.jpg';
            } else {
                this.selectedMatchBadges = { home: null, away: null };
            }
        },
        toggleGridView() {
            this.isGridView = !this.isGridView;
        },
        toggleFullScreen() {
            const playerContainer = document.getElementById('mainPlayer').parentNode;
            if (!document.fullscreenElement) {
                // Request fullscreen
                if (playerContainer.requestFullscreen) {
                    playerContainer.requestFullscreen();
                } else if (playerContainer.webkitRequestFullscreen) { /* Safari */
                    playerContainer.webkitRequestFullscreen();
                } else if (playerContainer.mozRequestFullscreen) { /* Firefox */
                    playerContainer.mozRequestFullscreen();
                } else if (playerContainer.msRequestFullscreen) { /* IE11 */
                    playerContainer.msRequestFullscreen();
                }
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                    document.webkitExitFullscreen();
                } else if (document.mozExitFullscreen) { /* Firefox */
                    document.mozExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                    document.msExitFullscreen();
                }
            }
        }
    }
}
