# Tower of Fate API Documentation
# 命运塔 API 文档

## Base URL
```
Production: https://api.toweroffate.com/v1
Staging: https://api-staging.toweroffate.com/v1
```

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": "usr_123456",
      "username": "PlayerOne",
      "email": "user@example.com",
      "level": 25,
      "rank": "Diamond"
    }
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

---

## Game API

### Get Game State
```http
GET /game/state/{gameId}
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "gameId": "game_789",
  "status": "in_progress",
  "currentPlayer": "usr_123456",
  "currentFloor": 5,
  "guardian": "spade",
  "players": [
    {
      "id": "usr_123456",
      "username": "PlayerOne",
      "position": 5,
      "hand": ["S3", "H7", "DK"],
      "cardsPlayed": 12
    },
    {
      "id": "usr_789012",
      "username": "PlayerTwo",
      "position": 3,
      "hand": ["C5", "S9", "HA"],
      "cardsPlayed": 10
    }
  ],
  "deckRemaining": 156,
  "angerCardsRemaining": 12,
  "specialCardsRemaining": 8
}
```

### Play Card
```http
POST /game/play
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "gameId": "game_789",
  "card": "S3"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "floorAdvanced": true,
    "newFloor": 6,
    "guardianChanged": false,
    "effect": null,
    "nextPlayer": "usr_789012"
  }
}
```

### Get Game History
```http
GET /game/history?limit=20&offset=0
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "games": [
    {
      "gameId": "game_789",
      "result": "win",
      "mode": "ranked",
      "duration": 420,
      "finalPosition": 1,
      "rewards": {
        "xp": 150,
        "coins": 250,
        "rankPoints": 15
      },
      "playedAt": "2026-03-07T15:30:00Z"
    }
  ],
  "total": 156,
  "limit": 20,
  "offset": 0
}
```

### Create Private Game
```http
POST /game/create
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "mode": "private",
  "maxPlayers": 4,
  "towerTheme": "classic",
  "deckTheme": "fantasy",
  "inviteOnly": true
}
```

---

## Player API

### Get Player Profile
```http
GET /players/{playerId}
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "usr_123456",
  "username": "PlayerOne",
  "avatar": "https://cdn.toweroffate.com/avatars/123.png",
  "level": 25,
  "xp": 12500,
  "rank": "Diamond",
  "rankPoints": 2850,
  "stats": {
    "gamesPlayed": 523,
    "gamesWon": 312,
    "winRate": 0.596,
    "favoriteDeck": "fantasy",
    "highestFloor": 13,
    "longestStreak": 12
  },
  "collections": {
    "cardsOwned": 187,
    "towersUnlocked": 8,
    "achievements": 34
  },
  "createdAt": "2025-06-15T10:00:00Z",
  "lastLogin": "2026-03-07T14:00:00Z"
}
```

### Update Profile
```http
PUT /players/{playerId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "username": "NewUsername",
  "avatar": "avatar_456.png",
  "bio": "Tower climbing enthusiast!"
}
```

### Get Player Cards
```http
GET /players/{playerId}/cards
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "cards": [
    {
      "id": "card_001",
      "name": "Shield of Protection",
      "type": "special",
      "rarity": "rare",
      "effect": "block_anger",
      "count": 3,
      "maxCount": 5
    }
  ],
  "totalCards": 187,
  "categories": {
    "common": 89,
    "uncommon": 56,
    "rare": 28,
    "epic": 12,
    "legendary": 2
  }
}
```

---

## Tournament API

### List Tournaments
```http
GET /tournaments?status=open&page=1&limit=10
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "tournaments": [
    {
      "id": "tour_123",
      "name": "Spring Championship 2026",
      "status": "open",
      "format": "single_elimination",
      "entryFee": 500,
      "prizePool": 10000,
      "maxParticipants": 64,
      "registered": 45,
      "startsAt": "2026-03-15T18:00:00Z",
      "endsAt": "2026-03-17T22:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

### Register for Tournament
```http
POST /tournaments/{tournamentId}/register
Authorization: Bearer {accessToken}
```

### Get Tournament Bracket
```http
GET /tournaments/{tournamentId}/bracket
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "tournamentId": "tour_123",
  "format": "single_elimination",
  "rounds": [
    {
      "round": 1,
      "matches": [
        {
          "matchId": "match_001",
          "player1": { "id": "usr_001", "username": "Player1" },
          "player2": { "id": "usr_002", "username": "Player2" },
          "winner": null,
          "scheduledAt": "2026-03-15T18:00:00Z"
        }
      ]
    }
  ]
}
```

---

## Shop API

### Get Shop Items
```http
GET /shop/items?category=cards
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "items": [
    {
      "id": "pack_001",
      "name": "Fantasy Pack",
      "type": "card_pack",
      "price": 1000,
      "currency": "coins",
      "contents": {
        "guaranteed": 3,
        "rarity": {
          "common": 0.60,
          "uncommon": 0.25,
          "rare": 0.10,
          "epic": 0.04,
          "legendary": 0.01
        }
      },
      "image": "https://cdn.toweroffate.com/packs/fantasy.png"
    }
  ]
}
```

### Purchase Item
```http
POST /shop/purchase
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "itemId": "pack_001",
  "quantity": 1,
  "currency": "coins"
}
```

---

## Admin API

### Get Users List
```http
GET /admin/users?status=active&page=1&limit=50
Authorization: Bearer {adminToken}
```

### Ban User
```http
POST /admin/users/{userId}/ban
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "type": "temporary",
  "duration": 7,
  "reason": "cheating",
  "notes": "Used unauthorized third-party software"
}
```

### Get Analytics
```http
GET /admin/analytics?metric=dau&startDate=2026-03-01&endDate=2026-03-07
Authorization: Bearer {adminToken}
```

**Response:**
```json
{
  "metric": "dau",
  "period": "2026-03-01 to 2026-03-07",
  "data": [
    { "date": "2026-03-01", "value": 1250 },
    { "date": "2026-03-02", "value": 1320 },
    { "date": "2026-03-03", "value": 1280 }
  ],
  "average": 1283,
  "growth": "+5.2%"
}
```

### Create Tournament (Admin)
```http
POST /admin/tournaments
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "name": "Summer Championship 2026",
  "format": "double_elimination",
  "entryFee": 1000,
  "prizePool": 50000,
  "maxParticipants": 128,
  "startsAt": "2026-06-01T18:00:00Z",
  "endsAt": "2026-06-03T22:00:00Z",
  "eligibility": {
    "minRank": "Gold",
    "regions": ["US", "EU", "ASIA"]
  }
}
```

---

## Webhooks

### Register Webhook
```http
POST /webhooks/register
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["game.completed", "tournament.won", "rank.changed"],
  "secret": "your_webhook_secret"
}
```

### Events

#### game.completed
```json
{
  "event": "game.completed",
  "timestamp": "2026-03-07T15:30:00Z",
  "data": {
    "gameId": "game_789",
    "mode": "ranked",
    "players": [
      { "id": "usr_123", "position": 1, "result": "win" },
      { "id": "usr_456", "position": 2, "result": "loss" }
    ],
    "duration": 420,
    "tower": "mystic_castle"
  }
}
```

#### tournament.won
```json
{
  "event": "tournament.won",
  "timestamp": "2026-03-07T20:00:00Z",
  "data": {
    "tournamentId": "tour_123",
    "playerId": "usr_123",
    "position": 1,
    "prize": 5000,
    "currency": "coins"
  }
}
```

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| 1001 | Invalid credentials | 401 |
| 1002 | Token expired | 401 |
| 1003 | Insufficient permissions | 403 |
| 2001 | Game not found | 404 |
| 2002 | Invalid move | 400 |
| 2003 | Not your turn | 403 |
| 3001 | Insufficient balance | 402 |
| 3002 | Item not available | 404 |
| 4001 | Tournament full | 409 |
| 4002 | Already registered | 409 |
| 5001 | Rate limit exceeded | 429 |
| 5002 | Server error | 500 |

---

## Rate Limiting

- **Authentication**: 5 requests/minute
- **Game Actions**: 30 requests/minute
- **General API**: 100 requests/minute
- **Admin API**: 200 requests/minute

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1646671200
```

---

## SDK Examples

### JavaScript
```javascript
const TowerAPI = require('@toweroffate/sdk');

const client = new TowerAPI({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Login
const session = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Play a card
const result = await client.game.play({
  gameId: 'game_789',
  card: 'S3'
});

// Get player profile
const profile = await client.players.get('usr_123456');
```

### Python
```python
from toweroffate import TowerClient

client = TowerClient(api_key='your_api_key')

# Login
session = client.auth.login(
    email='user@example.com',
    password='password'
)

# Get game state
game = client.game.get_state('game_789')

# List tournaments
tournaments = client.tournaments.list(status='open')
```

---

*API Version: 1.0.0*
*Last Updated: March 2026*
