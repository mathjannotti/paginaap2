const HASH_PASS ="db36f96abf366f9e28583fe898ce814e4bc480102aa2e276eec4a28227588704";
const PASSWORD = "UMASENHA";
const PLACEHOLDER_IMAGE = 'placeholder.png'; // Caminho para a imagem placeholder
let playersData = [];

function login() {
    const password = document.getElementById('password').value;
    if (password === PASSWORD) {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-page').style.display = 'block';
    } else {
        alert('Senha incorreta!');
    }
}

function logout() {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('password').value = '';
}

function loadPlayers(type) {
    let url;
    if (type === 'all') {
        url = 'https://botafogo-atletas.mange.li/2024-1/all';
    } else if (type === 'masculino') {
        url = 'https://botafogo-atletas.mange.li/2024-1/masculino';
    } else {
        url = 'https://botafogo-atletas.mange.li/2024-1/feminino';
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Armazena os dados dos jogadores
            playersData = data;

            // Ordenar os jogadores pelo nome
            data.sort((a, b) => a.nome.localeCompare(b.nome));

            const container = document.getElementById('players-container');
            container.innerHTML = '';
            data.forEach(player => {
                const playerCard = document.createElement('div');
                playerCard.className = 'player-card';
                playerCard.innerHTML = `
                    <img src="${player.imagem}" alt="${player.nome}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';">
                    <h3>${player.nome}</h3>
                    <button onclick='showPlayerDetails(${player.id})'>Saiba mais</button>
                `;
                container.appendChild(playerCard);
            });
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
}

function showPlayerDetails(playerId) {
    const player = playersData.find(p => p.id === playerId);

    if (player) {
        document.getElementById('main-page').style.display = 'none';
        document.getElementById('player-details-page').style.display = 'block';
        const details = document.getElementById('player-details');
        details.innerHTML = `
            <div class="player-details-container">
                <div class="player-image">
                    <img src="${player.imagem}" alt="${player.nome}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';">
                </div>
                <div class="player-info">
                    <h2>${player.nome}</h2>
                    <p><strong>Posição:</strong> ${player.posicao}</p>
                    <p><strong>Naturalidade:</strong> ${player.naturalidade}</p>
                    <p><strong>Data de Nascimento:</strong> ${player.nascimento}</p>
                    <p><strong>Altura:</strong> ${player.altura}</p>
                    <p><strong>No Botafogo desde:</strong> ${player.no_botafogo_desde}</p>
                    <p><strong>Número de Jogos:</strong> ${player.n_jogos}</p>
                    <p><strong>Detalhes:</strong> ${player.detalhes}</p>
                    <a href="${player.url_detalhes}" target="_blank">Ver mais detalhes</a>
                </div>
            </div>
        `;
    } else {
        console.error('Player not found:', playerId);
    }
}

function backToMain() {
    document.getElementById('player-details-page').style.display = 'none';
    document.getElementById('main-page').style.display = 'block';
}

function searchPlayer() {
    const search = document.getElementById('search').value.toLowerCase();
    const players = document.querySelectorAll('.player-card');
    players.forEach(player => {
        const name = player.querySelector('h3').innerText.toLowerCase();
        if (name.includes(search)) {
            player.style.display = 'block';
        } else {
            player.style.display = 'none';
        }
    });
}

// Adicionando o <select> para seleção de elenco na página principal
window.addEventListener('load', () => {
    const buttonsContainer = document.querySelector('.buttons');
    const selectEl = document.createElement('select');
    selectEl.innerHTML = `
        <option value="all">Elenco Completo</option>
        <option value="masculino">Masculino</option>
        <option value="feminino">Feminino</option>
    `;
    selectEl.addEventListener('change', (e) => {
        loadPlayers(e.target.value);
    });
    buttonsContainer.appendChild(selectEl);
});
