const API_BASE_URL = 'https://localhost:7028/api';

class SoccerApp {
    constructor() {
        this.contentContainer = document.getElementById('app-content');
        this.init();
    }

    init() {
        this.navigateTo('teams');
    }

    async navigateTo(view, id = null) {
        this.contentContainer.innerHTML = '<p>Завантаження...</p>';
        try {
            if (view === 'teams') await this.renderTeamsList();
            else if (view === 'team-form') await this.renderTeamForm(id);
            else if (view === 'players') await this.renderPlayersList();
            else if (view === 'player-form') await this.renderPlayerForm(id);
        } catch (error) {
            this.contentContainer.innerHTML = `<p style="color: red;">Помилка: ${error.message}</p>`;
        }
    }

    // ==========================================
    // CRUD для Команд (TeamsController)
    // ==========================================

    async renderTeamsList() {
        const response = await fetch(`${API_BASE_URL}/teams`); // GET: api/teams
        const teams = await response.json();

        let html = `
            <h2>Список команд</h2>
            <button onclick="app.navigateTo('team-form')" style="margin-bottom: 1rem;">+ Додати команду</button>
            <table>
                <thead>
                    <tr><th>Назва</th><th>Тренер</th><th>Дії</th></tr>
                </thead>
                <tbody>
        `;

        teams.forEach(team => { // Використання TeamDTO 
            html += `
                <tr>
                    <td>${team.name}</td>
                    <td>${team.coach}</td>
                    <td>
                        <button onclick="app.navigateTo('team-form', ${team.id})">Редагувати</button>
                        <button onclick="app.deleteTeam(${team.id})" style="background-color: #dc3545;">Видалити</button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        this.contentContainer.innerHTML = html;
    }

    async renderTeamForm(id) {
        let team = { id: 0, name: '', coach: '' };

        if (id) {
            const response = await fetch(`${API_BASE_URL}/teams/${id}`); // GET: api/teams/{id}
            team = await response.json();
        }

        this.contentContainer.innerHTML = `
            <h2>${id ? 'Редагувати' : 'Додати'} команду</h2>
            <form onsubmit="app.saveTeam(event)">
                <input type="hidden" id="teamId" value="${team.id}">
                <div class="form-group">
                    <label>Назва команди:</label>
                    <input type="text" id="teamName" value="${team.name}" required>
                </div>
                <div class="form-group">
                    <label>Головний тренер:</label>
                    <input type="text" id="teamCoach" value="${team.coach}" required>
                </div>
                <button type="submit">Зберегти</button>
                <button type="button" onclick="app.navigateTo('teams')" style="background-color: #6c757d;">Скасувати</button>
            </form>
        `;
    }

    async saveTeam(event) {
        event.preventDefault();
        const id = parseInt(document.getElementById('teamId').value);

        const teamDto = { // Формування TeamDTO
            id: id,
            name: document.getElementById('teamName').value,
            coach: document.getElementById('teamCoach').value
        };

        const isNew = id === 0;
        const method = isNew ? 'POST' : 'PUT'; // POST або PUT
        const url = isNew ? `${API_BASE_URL}/teams` : `${API_BASE_URL}/teams/${id}`;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teamDto)
        });

        if (response.ok) {
            await this.navigateTo('teams');
        } else {
            alert('Помилка при збереженні команди');
        }
    }

    async deleteTeam(id) {
        if (!confirm('Ви впевнені, що хочете видалити цю команду?')) return;

        const response = await fetch(`${API_BASE_URL}/teams/${id}`, { // DELETE: api/teams/{id}
            method: 'DELETE'
        });

        if (response.ok) await this.renderTeamsList();
        else alert('Помилка при видаленні команди');
    }

    // ==========================================
    // CRUD для Гравців (PlayersController)
    // ==========================================

    async renderPlayersList() {
        const response = await fetch(`${API_BASE_URL}/players`); // GET: api/players
        const players = await response.json();

        let html = `
            <h2>Список гравців</h2>
            <button onclick="app.navigateTo('player-form')" style="margin-bottom: 1rem;">+ Додати гравця</button>
            <table>
                <thead>
                    <tr><th>Ім'я</th><th>Рік</th><th>Позиція</th><th>Команда</th><th>Дії</th></tr>
                </thead>
                <tbody>
        `;

        players.forEach(player => { // Використання PlayerDTO
            html += `
                <tr>
                    <td>${player.name}</td>
                    <td>${player.birthYear}</td>
                    <td>${player.position}</td>
                    <td>${player.team || '-'}</td>
                    <td class="action-buttons">
                        <button onclick="app.navigateTo('player-form', ${player.id})">Редагувати</button>
                        <button onclick="app.deletePlayer(${player.id})" style="background-color: #dc3545;">Видалити</button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        this.contentContainer.innerHTML = html;
    }

    async renderPlayerForm(id) {
        let player = { id: 0, name: '', birthYear: '', position: '', teamId: '' };

        if (id) {
            const response = await fetch(`${API_BASE_URL}/players/${id}`); // GET: api/players/{id}
            player = await response.json();
        }

        // Завантажуємо список команд для випадаючого списку (select)
        const teamsResponse = await fetch(`${API_BASE_URL}/teams`);
        const teams = await teamsResponse.json();

        let teamOptions = `<option value="">-- Без команди --</option>`;
        teams.forEach(t => {
            const selected = t.id === player.teamId ? 'selected' : '';
            teamOptions += `<option value="${t.id}" ${selected}>${t.name}</option>`;
        });

        this.contentContainer.innerHTML = `
            <h2>${id ? 'Редагувати' : 'Додати'} гравця</h2>
            <form onsubmit="app.savePlayer(event)">
                <input type="hidden" id="playerId" value="${player.id}">
                <div class="form-group">
                    <label>Ім'я гравця:</label>
                    <input type="text" id="playerName" value="${player.name}" required>
                </div>
                <div class="form-group">
                    <label>Рік народження:</label>
                    <input type="number" id="playerYear" value="${player.birthYear}" required>
                </div>
                <div class="form-group">
                    <label>Позиція:</label>
                    <input type="text" id="playerPosition" value="${player.position}" required>
                </div>
                <div class="form-group">
                    <label>Команда:</label>
                    <select id="playerTeamId">
                        ${teamOptions}
                    </select>
                </div>
                <button type="submit">Зберегти</button>
                <button type="button" onclick="app.navigateTo('players')" style="background-color: #6c757d;">Скасувати</button>
            </form>
        `;
    }

    async savePlayer(event) {
        event.preventDefault();
        const id = parseInt(document.getElementById('playerId').value);
        const teamIdValue = document.getElementById('playerTeamId').value;

        const playerDto = { // Формування PlayerDTO
            id: id,
            name: document.getElementById('playerName').value,
            birthYear: parseInt(document.getElementById('playerYear').value),
            position: document.getElementById('playerPosition').value,
            teamId: teamIdValue ? parseInt(teamIdValue) : null
        };

        const isNew = id === 0;
        const method = isNew ? 'POST' : 'PUT'; // POST або PUT
        const url = isNew ? `${API_BASE_URL}/players` : `${API_BASE_URL}/players/${id}`;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playerDto)
        });

        if (response.ok) {
            await this.navigateTo('players');
        } else {
            alert('Помилка при збереженні гравця');
        }
    }

    async deletePlayer(id) {
        if (!confirm('Ви впевнені, що хочете видалити цього гравця?')) return;

        const response = await fetch(`${API_BASE_URL}/players/${id}`, { // DELETE: api/players/{id}
            method: 'DELETE'
        });

        if (response.ok) await this.renderPlayersList();
        else alert('Помилка при видаленні гравця');
    }
}

const app = new SoccerApp();