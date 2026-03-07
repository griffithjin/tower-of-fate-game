# Tower of Fate - Admin Guide
# 命运塔 - 管理员使用手册

## 📖 Table of Contents
1. [Dashboard Overview](#dashboard-overview)
2. [Managing Assets](#managing-assets)
3. [User Management](#user-management)
4. [Tournament Management](#tournament-management)
5. [Analytics & Reports](#analytics--reports)
6. [AB Testing](#ab-testing)
7. [System Settings](#system-settings)
8. [Troubleshooting](#troubleshooting)

---

## Dashboard Overview

### Real-time Statistics
The admin dashboard provides comprehensive real-time data:

- **Active Players**: Current online users
- **Games in Progress**: Number of active games
- **Revenue Today**: Daily earnings from all sources
- **New Registrations**: Users who signed up today
- **Server Status**: Health of all game servers

### Navigation
```
Dashboard
├── Overview
├── Players
├── Games
├── Tournaments
├── Assets
├── Analytics
├── Settings
└── Support
```

### Key Metrics Cards
1. **Player Engagement**
   - DAU (Daily Active Users)
   - MAU (Monthly Active Users)
   - Average Session Duration
   - Retention Rate (D1, D7, D30)

2. **Financial Metrics**
   - Daily Revenue
   - ARPDAU (Average Revenue Per Daily Active User)
   - Conversion Rate
   - Top Spenders

3. **Game Health**
   - Matchmaking Success Rate
   - Server Response Time
   - Error Rate
   - Support Ticket Volume

---

## Managing Assets

### Tower Models

#### Upload New Tower
1. Navigate to Assets → Towers → Add New
2. Fill in tower details:
   - **Name**: Tower display name
   - **Theme**: Select theme category
   - **Difficulty**: Easy / Normal / Hard
   - **Regions**: Available regions
3. Upload tower images:
   - Preview image (512x512px)
   - Full view (1024x1024px)
   - 3D model files (.glb, .gltf)
4. Configure 3D settings:
   - Rotation speed
   - Animation triggers
   - Lighting effects
5. Set difficulty parameters:
   - Anger card frequency
   - Special card spawn rate
   - Reward multipliers
6. Save and publish

#### Edit Tower Configuration
```javascript
// Example tower config
towerConfig = {
  id: "tower_001",
  name: "Mystic Castle",
  theme: "fantasy",
  difficulty: "hard",
  floors: 13,
  angerCardRate: 0.15,      // 15% chance
  specialCardRate: 0.08,    // 8% chance
  rewardMultiplier: 1.5,
  regions: ["US", "EU", "ASIA"]
}
```

### Card Decks

#### Create New Deck Theme
1. Go to Assets → Cards → Deck Themes
2. Click "Create Theme"
3. Configure:
   - Theme name
   - Card back design
   - Color scheme
   - Special effects
4. Design card faces:
   - Number cards (2-10)
   - Face cards (J, Q, K, A)
   - Special cards
5. Set card abilities:
   - Effect type
   - Trigger conditions
   - Duration
   - Cooldown
6. Test deck in simulator
7. Publish to players

#### Edit Card Symbols
```css
/* Card symbol styles */
.card-spade { color: #000000; }
.card-heart { color: #ff0000; }
.card-diamond { color: #ff0000; }
.card-club { color: #000000; }
.card-special { 
  background: linear-gradient(45deg, #gold, #yellow);
  border: 2px solid #orange;
}
```

#### Configure Special Effects
| Effect Type | Description | Configuration |
|-------------|-------------|---------------|
| Shield | Block anger cards | duration: 1 turn |
| Teleport | Jump floors | range: any floor |
| Swap | Exchange position | target: single player |
| Double | Double next match | multiplier: 2x |

### Postcards

#### Upload Postcard Images
1. Navigate to Assets → Postcards
2. Click "Upload New"
3. Upload images:
   - Full resolution (1200x800px)
   - Thumbnail (300x200px)
4. Add metadata:
   - Title
   - Blessing message
   - Rarity level
   - Availability period
5. Set regional restrictions (optional)
6. Publish

#### Edit Blessing Messages
```json
{
  "postcard_id": "pc_001",
  "title": "Good Fortune",
  "message": "May the cards be in your favor!",
  "translations": {
    "zh": "愿卡牌眷顾你！",
    "ja": "カードがあなたに味方しますように！",
    "ko": "카드가 당신의 편이 되길!"
  },
  "rarity": "epic",
  "send_limit": 3
}
```

#### Set Rarity Levels
- **Common**: 60% drop rate
- **Uncommon**: 25% drop rate
- **Rare**: 10% drop rate
- **Epic**: 4% drop rate
- **Legendary**: 1% drop rate

---

## User Management

### View User Profiles
1. Go to Users → Player List
2. Search by:
   - Username
   - Email
   - Player ID
   - Registration date
3. View detailed profile:
   - Account info
   - Game statistics
   - Purchase history
   - Support tickets
   - Login history

### Manage Bans

#### Temporary Ban
1. Find user in player list
2. Click "Actions" → "Ban"
3. Select duration: 1 day / 7 days / 30 days
4. Enter reason:
   - Cheating
   - Harassment
   - Exploits
   - Other (specify)
5. Confirm ban

#### Permanent Ban
```javascript
// Ban user API
POST /api/admin/users/{userId}/ban
{
  "type": "permanent",
  "reason": "cheating",
  "evidence": "replay_id_12345",
  "notes": "Used speed hack in tournament"
}
```

#### Appeal Process
1. User submits appeal via support ticket
2. Admin reviews case
3. Options:
   - Uphold ban
   - Reduce ban duration
   - Remove ban
4. Notify user of decision

### Handle Refunds

#### Review Refund Request
1. Go to Support → Refunds
2. Review purchase details:
   - Transaction ID
   - Amount
   - Date
   - Item purchased
3. Check user history:
   - Previous refunds
   - Account standing
   - Play time since purchase
4. Decision options:
   - Approve full refund
   - Approve partial refund
   - Deny refund
5. Process refund through payment provider

---

## Tournament Management

### Create New Tournament
1. Navigate to Tournaments → Create
2. Configure basic info:
   - Tournament name
   - Start/end dates
   - Registration period
   - Entry fee
3. Set format:
   - Single elimination
   - Double elimination
   - Round robin
   - Swiss system
4. Define prize pool:
   - 1st place: 40%
   - 2nd place: 25%
   - 3rd place: 15%
   - 4th-8th: 20% (split)
5. Set eligibility:
   - Minimum rank
   - Regional restrictions
   - Age requirements
6. Publish tournament

### Monitor Tournament Progress
```
Tournament Dashboard
├── Registration Stats
│   ├── Total entries
│   ├── Capacity filled %
│   └── Registration deadline
├── Current Round
│   ├── Matches in progress
│   ├── Completed matches
│   └── Disputed results
├── Leaderboard
│   ├── Current standings
│   ├── Top performers
│   └── Eliminated players
└── Prize Distribution
    ├── Confirmed winners
    ├── Pending verification
    └── Paid out amounts
```

### Handle Disputes
1. Review dispute claim
2. Examine game replay
3. Consult server logs
4. Make ruling:
   - Uphold result
   - Reverse result
   - Rematch required
   - Both players disqualified
5. Document decision
6. Notify players

---

## Analytics & Reports

### DAU/MAU Reports

#### Daily Active Users
```javascript
// Generate DAU report
{
  "period": "2026-03-01 to 2026-03-07",
  "metrics": {
    "dau": [1250, 1320, 1280, 1450, 1620, 1890, 1750],
    "newUsers": [120, 145, 130, 160, 180, 210, 195],
    "returningUsers": [1130, 1175, 1150, 1290, 1440, 1680, 1555]
  },
  "average": 1508,
  "growth": "+12.5%"
}
```

#### Monthly Active Users
- Track MAU trends
- Calculate stickiness (DAU/MAU ratio)
- Identify churn patterns
- Compare month-over-month

### Revenue Analysis

#### Revenue Breakdown
| Source | Amount | Percentage |
|--------|--------|------------|
| Tournament Entry | $12,500 | 45% |
| Card Packs | $6,800 | 24% |
| Premium Themes | $4,200 | 15% |
| Subscriptions | $2,800 | 10% |
| Other | $1,700 | 6% |
| **Total** | **$28,000** | **100%** |

#### Retention Metrics
```
Cohort Analysis
├── Day 1 Retention: 45%
├── Day 7 Retention: 28%
├── Day 30 Retention: 15%
└── Day 90 Retention: 8%
```

### Custom Reports
1. Go to Analytics → Custom Reports
2. Select metrics to include
3. Set date range
4. Choose grouping (daily/weekly/monthly)
5. Add filters:
   - Region
   - Platform
   - User segment
6. Generate and export

---

## AB Testing

### Create New Test
1. Navigate to Experiments → Create Test
2. Define test parameters:
   - Test name
   - Hypothesis
   - Primary metric
   - Success criteria
3. Create variants:
   - Control (A)
   - Variant (B)
   - Additional variants (optional)
4. Set traffic allocation:
   - 50/50 split
   - Or custom percentages
5. Define audience:
   - All users
   - New users only
   - Specific regions
6. Set duration
7. Launch test

### Monitor Results
```
AB Test: "New Tutorial Flow"
├── Control (A)
│   ├── Users: 5,000
│   ├── Conversion: 32%
│   └── Revenue: $1,200
├── Variant (B)
│   ├── Users: 5,000
│   ├── Conversion: 38%
│   └── Revenue: $1,450
├── Confidence: 95%
├── Winner: Variant B
└── Recommendation: Deploy B
```

### Apply Winning Variant
1. Review final results
2. Verify statistical significance
3. Click "Apply Winner"
4. Roll out to 100% of users
5. Document learnings

---

## System Settings

### General Settings
- Site name and branding
- Default language
- Time zone
- Maintenance mode

### Security Settings
- Password requirements
- 2FA enforcement
- IP whitelist/blacklist
- Rate limiting

### Payment Settings
- Supported currencies
- Payment providers
- Refund policy
- Tax configuration

### Notification Settings
- Email templates
- Push notification config
- In-game notification rules
- Scheduled announcements

---

## Troubleshooting

### Common Issues

#### High Server Load
1. Check active games count
2. Review player distribution
3. Scale up server instances
4. Enable maintenance mode if needed

#### Payment Failures
1. Check payment provider status
2. Verify API credentials
3. Review error logs
4. Contact payment provider support

#### Matchmaking Issues
1. Check player pool size
2. Review matchmaking parameters
3. Adjust ELO range
4. Monitor queue times

### Emergency Procedures

#### Server Downtime
1. Enable maintenance page
2. Notify players via social media
3. Investigate root cause
4. Apply fix
5. Gradual restart
6. Monitor closely

#### Security Breach
1. Enable lockdown mode
2. Force password resets
3. Audit access logs
4. Notify affected users
5. Engage security team
6. Post-incident review

---

## Support Resources

### Admin Discord
- Channel: #admin-support
- Response time: < 2 hours

### Documentation
- API Reference: /docs/api
- Player Guide: /docs/player-guide
- Technical Docs: /docs/technical

### Escalation Contacts
- Level 1: support@toweroffate.com
- Level 2: admin-leads@toweroffate.com
- Level 3: dev-team@toweroffate.com
- Emergency: +1-800-TOWER-01

---

**For additional support, contact the development team.**

*Admin Guide v1.0.0 - Last Updated: March 2026*
