using UnityEngine;
using System;
using System.Collections.Generic;
using System.Linq;

namespace TowerOfFate.Network
{
    /// <summary>
    /// 网络消息类型
    /// </summary>
    public enum NetworkMessageType
    {
        PlayerJoin,
        PlayerLeave,
        GameStart,
        PlayCard,
        RevealCards,
        SyncState,
        Chat,
        Error
    }

    /// <summary>
    /// 网络消息
    /// </summary>
    [Serializable]
    public class NetworkMessage
    {
        public NetworkMessageType Type;
        public string SenderId;
        public string Data;
        public float Timestamp;
    }

    /// <summary>
    /// 网络管理器 - 完整实现
    /// </summary>
    public class NetworkManager : MonoBehaviour
    {
        public static NetworkManager Instance { get; private set; }

        [Header("Network Settings")]
        [SerializeField] private string serverAddress = "127.0.0.1";
        [SerializeField] private int serverPort = 7777;
        [SerializeField] private float syncRate = 0.1f;

        public bool IsConnected { get; private set; } = false;
        public bool IsHost { get; private set; } = false;
        public string LocalPlayerId { get; private set; }
        public RoomInfo CurrentRoom { get; private set; }

        // 在线玩家列表
        private Dictionary<string, NetworkPlayer> players = new Dictionary<string, NetworkPlayer>();
        private Queue<NetworkMessage> messageQueue = new Queue<NetworkMessage>();
        private float lastSyncTime = 0;

        // 事件
        public event Action OnConnected;
        public event Action OnDisconnected;
        public event Action<string> OnError;
        public event Action<NetworkPlayer> OnPlayerJoined;
        public event Action<NetworkPlayer> OnPlayerLeft;
        public event Action<NetworkMessage> OnMessageReceived;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            LocalPlayerId = SystemInfo.deviceUniqueIdentifier;
        }

        private void Update()
        {
            if (!IsConnected) return;

            // 处理消息队列
            ProcessMessageQueue();

            // 主机定期同步游戏状态
            if (IsHost && Time.time - lastSyncTime > syncRate)
            {
                SyncGameStateToClients();
                lastSyncTime = Time.time;
            }
        }

        #region 房间管理

        /// <summary>
        /// 创建房间 (主机)
        /// </summary>
        public void CreateRoom(string roomName, int maxPlayers = 4, string password = "")
        {
            Debug.Log($"[NetworkManager] 创建房间: {roomName} (最大{maxPlayers}人)");
            
            IsHost = true;
            IsConnected = true;
            
            CurrentRoom = new RoomInfo
            {
                RoomId = GenerateRoomCode(),
                RoomName = roomName,
                HostName = "Host",
                HostId = LocalPlayerId,
                CurrentPlayers = 1,
                MaxPlayers = maxPlayers,
                HasPassword = !string.IsNullOrEmpty(password),
                Ping = 0
            };

            // 添加自己到玩家列表
            var localPlayer = new NetworkPlayer
            {
                PlayerId = LocalPlayerId,
                PlayerName = "玩家1",
                IsHost = true,
                IsReady = false
            };
            players[LocalPlayerId] = localPlayer;

            OnConnected?.Invoke();
            Debug.Log($"[NetworkManager] 房间创建成功，房间码: {CurrentRoom.RoomId}");
        }

        /// <summary>
        /// 加入房间
        /// </summary>
        public void JoinRoom(string roomCode, string password = "")
        {
            Debug.Log($"[NetworkManager] 加入房间: {roomCode}");
            
            IsHost = false;
            IsConnected = true;

            // 模拟加入成功（实际应连接服务器）
            var localPlayer = new NetworkPlayer
            {
                PlayerId = LocalPlayerId,
                PlayerName = $"玩家{players.Count + 1}",
                IsHost = false,
                IsReady = false
            };
            players[LocalPlayerId] = localPlayer;

            OnConnected?.Invoke();
            
            // 通知其他玩家
            BroadcastMessage(NetworkMessageType.PlayerJoin, JsonUtility.ToJson(localPlayer));
        }

        /// <summary>
        /// 断开连接
        /// </summary>
        public void Disconnect()
        {
            if (!IsConnected) return;

            Debug.Log("[NetworkManager] 断开连接");
            
            BroadcastMessage(NetworkMessageType.PlayerLeave, LocalPlayerId);
            
            IsConnected = false;
            IsHost = false;
            players.Clear();
            messageQueue.Clear();
            CurrentRoom = null;
            
            OnDisconnected?.Invoke();
        }

        /// <summary>
        /// 离开房间
        /// </summary>
        public void LeaveRoom()
        {
            Disconnect();
        }

        #endregion

        #region 游戏同步

        /// <summary>
        /// 同步游戏状态 (主机→客户端)
        /// </summary>
        public void SyncGameState(GameState state, int level, Card guardCard)
        {
            if (!IsHost) return;

            var syncData = new GameStateSync
            {
                State = state,
                CurrentLevel = level,
                GuardCardSuit = (int)guardCard.suit,
                GuardCardRank = guardCard.rank,
                Timestamp = Time.time
            };

            BroadcastMessage(NetworkMessageType.SyncState, JsonUtility.ToJson(syncData));
        }

        /// <summary>
        /// 发送出牌
        /// </summary>
        public void SendPlayCard(string playerId, Card card)
        {
            var playData = new PlayCardData
            {
                PlayerId = playerId,
                CardSuit = (int)card.suit,
                CardRank = card.rank
            };

            BroadcastMessage(NetworkMessageType.PlayCard, JsonUtility.ToJson(playData));
            Debug.Log($"[NetworkManager] 玩家{playerId}出牌: {card}");
        }

        /// <summary>
        /// 发送亮牌
        /// </summary>
        public void SendRevealCards(Dictionary<string, Card> playedCards)
        {
            var revealData = new RevealData
            {
                PlayerCards = new List<PlayerCard>()
            };

            foreach (var kvp in playedCards)
            {
                revealData.PlayerCards.Add(new PlayerCard
                {
                    PlayerId = kvp.Key,
                    CardSuit = (int)kvp.Value.suit,
                    CardRank = kvp.Value.rank
                });
            }

            BroadcastMessage(NetworkMessageType.RevealCards, JsonUtility.ToJson(revealData));
        }

        /// <summary>
        /// 广播游戏开始
        /// </summary>
        public void BroadcastGameStart()
        {
            BroadcastMessage(NetworkMessageType.GameStart, "");
        }

        /// <summary>
        /// 发送聊天消息
        /// </summary>
        public void SendChatMessage(string message)
        {
            BroadcastMessage(NetworkMessageType.Chat, message);
        }

        #endregion

        #region 玩家管理

        /// <summary>
        /// 设置玩家准备状态
        /// </summary>
        public void SetReady(bool ready)
        {
            if (players.TryGetValue(LocalPlayerId, out var player))
            {
                player.IsReady = ready;
            }
        }

        /// <summary>
        /// 获取所有玩家
        /// </summary>
        public List<NetworkPlayer> GetAllPlayers()
        {
            return players.Values.ToList();
        }

        /// <summary>
        /// 获取本地玩家
        /// </summary>
        public NetworkPlayer GetLocalPlayer()
        {
            return players.TryGetValue(LocalPlayerId, out var player) ? player : null;
        }

        /// <summary>
        /// 检查是否所有玩家都准备
        /// </summary>
        public bool AreAllPlayersReady()
        {
            return players.Count > 1 && players.Values.All(p => p.IsReady || p.IsHost);
        }

        #endregion

        #region 房间列表

        /// <summary>
        /// 获取房间列表 (模拟)
        /// </summary>
        public void GetRoomList(Action<List<RoomInfo>> callback)
        {
            // 模拟房间列表
            var rooms = new List<RoomInfo>
            {
                new RoomInfo
                {
                    RoomId = "ABC123",
                    RoomName = "新手房间",
                    HostName = "玩家A",
                    CurrentPlayers = 2,
                    MaxPlayers = 4,
                    HasPassword = false,
                    Ping = 25
                },
                new RoomInfo
                {
                    RoomId = "DEF456",
                    RoomName = "高手对决",
                    HostName = "玩家B",
                    CurrentPlayers = 3,
                    MaxPlayers = 4,
                    HasPassword = true,
                    Ping = 35
                }
            };

            callback?.Invoke(rooms);
        }

        #endregion

        #region 内部方法

        private void BroadcastMessage(NetworkMessageType type, string data)
        {
            var message = new NetworkMessage
            {
                Type = type,
                SenderId = LocalPlayerId,
                Data = data,
                Timestamp = Time.time
            };

            // 添加到消息队列（实际应通过网络发送）
            messageQueue.Enqueue(message);
        }

        private void ProcessMessageQueue()
        {
            while (messageQueue.Count > 0)
            {
                var message = messageQueue.Dequeue();
                HandleMessage(message);
            }
        }

        private void HandleMessage(NetworkMessage message)
        {
            switch (message.Type)
            {
                case NetworkMessageType.PlayerJoin:
                    HandlePlayerJoin(message.Data);
                    break;
                case NetworkMessageType.PlayerLeave:
                    HandlePlayerLeave(message.Data);
                    break;
                case NetworkMessageType.GameStart:
                    Debug.Log("[NetworkManager] 游戏开始！");
                    break;
                case NetworkMessageType.PlayCard:
                    HandlePlayCard(message.Data);
                    break;
                case NetworkMessageType.RevealCards:
                    HandleRevealCards(message.Data);
                    break;
                case NetworkMessageType.SyncState:
                    HandleSyncState(message.Data);
                    break;
                case NetworkMessageType.Chat:
                    Debug.Log($"[Chat] {message.SenderId}: {message.Data}");
                    break;
            }

            OnMessageReceived?.Invoke(message);
        }

        private void HandlePlayerJoin(string data)
        {
            var player = JsonUtility.FromJson<NetworkPlayer>(data);
            if (player != null && !players.ContainsKey(player.PlayerId))
            {
                players[player.PlayerId] = player;
                OnPlayerJoined?.Invoke(player);
                Debug.Log($"[NetworkManager] 玩家加入: {player.PlayerName}");
            }
        }

        private void HandlePlayerLeave(string playerId)
        {
            if (players.TryGetValue(playerId, out var player))
            {
                players.Remove(playerId);
                OnPlayerLeft?.Invoke(player);
                Debug.Log($"[NetworkManager] 玩家离开: {player.PlayerName}");
            }
        }

        private void HandlePlayCard(string data)
        {
            var playData = JsonUtility.FromJson<PlayCardData>(data);
            Debug.Log($"[NetworkManager] 收到出牌: 玩家{playData.PlayerId} 出 {playData.CardSuit}{playData.CardRank}");
        }

        private void HandleRevealCards(string data)
        {
            var revealData = JsonUtility.FromJson<RevealData>(data);
            Debug.Log($"[NetworkManager] 亮牌: {revealData.PlayerCards.Count} 位玩家");
        }

        private void HandleSyncState(string data)
        {
            var syncData = JsonUtility.FromJson<GameStateSync>(data);
            // 客户端更新游戏状态
        }

        private void SyncGameStateToClients()
        {
            // 主机定期同步状态
            if (GameManager.Instance != null)
            {
                SyncGameState(
                    GameManager.Instance.CurrentState,
                    GameManager.Instance.CurrentLevel,
                    GameManager.Instance.GuardCard
                );
            }
        }

        private string GenerateRoomCode()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var random = new System.Random();
            return new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        #endregion
    }

    #region 数据类

    [Serializable]
    public class NetworkPlayer
    {
        public string PlayerId;
        public string PlayerName;
        public bool IsHost;
        public bool IsReady;
        public int Ping;
    }

    [Serializable]
    public class GameStateSync
    {
        public GameState State;
        public int CurrentLevel;
        public int GuardCardSuit;
        public int GuardCardRank;
        public float Timestamp;
    }

    [Serializable]
    public class PlayCardData
    {
        public string PlayerId;
        public int CardSuit;
        public int CardRank;
    }

    [Serializable]
    public class RevealData
    {
        public List<PlayerCard> PlayerCards;
    }

    [Serializable]
    public class PlayerCard
    {
        public string PlayerId;
        public int CardSuit;
        public int CardRank;
    }

    #endregion
}
