# 监控系统

命运塔游戏监控告警系统基于 Prometheus + Grafana 构建

## 组件

| 组件 | 功能 | 端口 |
|------|------|------|
| Prometheus | 指标收集 | 9090 |
| Grafana | 可视化 | 3001 |
| Alertmanager | 告警管理 | 9093 |
| Node Exporter | 系统指标 | 9100 |

## 指标类型

### 游戏指标
- `toweroffate_active_games` - 活跃游戏数
- `toweroffate_online_players` - 在线玩家数
- `toweroffate_game_duration_seconds` - 游戏时长分布
- `toweroffate_player_ascension_layers` - 玩家爬升层数

### API指标
- `toweroffate_api_requests_total` - API请求数
- `toweroffate_api_latency_seconds` - API延迟
- `toweroffate_websocket_connections` - WebSocket连接数

### 业务指标
- `toweroffate_payment_amount_total` - 支付金额
- `toweroffate_user_registrations_total` - 用户注册数
- `toweroffate_tournament_participation_total` - 锦标赛参与数

### 错误指标
- `toweroffate_errors_total` - 错误总数
- `toweroffate_database_errors_total` - 数据库错误
- `toweroffate_rate_limit_hits_total` - 限流触发数

## 告警规则

### Critical
- 服务宕机
- 数据库连接失败
- 错误率过高 (>10/s)
- 支付失败率激增 (>20%)

### Warning
- API延迟过高 (P95 >1s)
- 活跃游戏数过低 (<10)
- 内存使用率过高 (>90%)
- 磁盘空间不足 (<10%)

### Info
- 在线玩家数偏低
- 日活用户下降

## 访问地址

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- Alertmanager: http://localhost:9093

## 默认账号

Grafana:
- 用户名: admin
- 密码: (环境变量 GRAFANA_PASSWORD)
