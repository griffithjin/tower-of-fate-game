using System;
using System.Collections.Generic;
using UnityEngine;

namespace TowerOfFate
{
    /// <summary>
    /// 游戏状态
    /// </summary>
    public enum GameState
    {
        Waiting,        // 等待中
        Dealing,        // 发牌中
        Playing,        // 出牌阶段
        Revealing,      // 亮牌阶段
        Resolving,      // 结算阶段
        LevelComplete,  // 层完成
        GameOver        // 游戏结束
    }

    /// <summary>
    /// 游戏结果
    /// </summary>
    public enum PlayResult
    {
        Fail,           // 失败
        SuitMatch,      // 花色匹配
        PerfectMatch    // 完美匹配
    }

    /// <summary>
    /// 游戏管理器 - 核心逻辑
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Game Settings")]
        [SerializeField] private int maxLevels = 13;
        [SerializeField] private float turnTimeLimit = 30f;
        [SerializeField] private int handSize = 5;

        [Header("Current State")]
        [SerializeField] private GameState currentState = GameState.Waiting;
        [SerializeField] private int currentLevel = 1;
        [SerializeField] private Card guardCard;

        // 核心组件
        private DeckManager deckManager;
        private List<Player> players = new List<Player>();
        private Dictionary<Player, Card> playedCards = new Dictionary<Player, Card>();

        // 事件
        public event Action<GameState> OnGameStateChanged;
        public event Action<int> OnLevelStarted;
        public event Action<Player, Card, PlayResult> OnCardRevealed;
        public event Action<Player> OnPlayerWon;
        public event Action OnGameEnded;

        // 属性
        public GameState CurrentState => currentState;
        public int CurrentLevel => currentLevel;
        public Card GuardCard => guardCard;
        public IReadOnlyList<Player> Players => players;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        private void Start()
        {
            deckManager = new DeckManager();
            InitializeGame();
        }

        /// <summary>
        /// 初始化游戏
        /// </summary>
        public void InitializeGame()
        {
            Debug.Log("[GameManager] 初始化游戏");
            
            deckManager.Initialize();
            players.Clear();
            playedCards.Clear();
            currentLevel = 1;

            // 创建4个AI玩家（单机测试）
            for (int i = 0; i < 4; i++)
            {
                players.Add(new Player($"player_{i}", $"玩家{i + 1}", true));
            }

            SetGameState(GameState.Waiting);
        }

        /// <summary>
        /// 开始游戏
        /// </summary>
        public void StartGame()
        {
            Debug.Log("[GameManager] 游戏开始！");
            StartLevel();
        }

        /// <summary>
        /// 开始新的一层
        /// </summary>
        private void StartLevel()
        {
            if (currentLevel > maxLevels)
            {
                EndGame();
                return;
            }

            Debug.Log($"[GameManager] 开始第 {currentLevel} 层");
            
            playedCards.Clear();
            SetGameState(GameState.Dealing);

            // 弃置所有玩家手牌
            foreach (var player in players)
            {
                if (player.Hand.Count > 0)
                {
                    deckManager.DiscardCards(player.Hand);
                    player.Hand.Clear();
                }
            }

            // 发新手牌
            foreach (var player in players)
            {
                player.Hand = deckManager.DrawHand(handSize);
                Debug.Log($"{player.PlayerName} 手牌: {string.Join(", ", player.Hand)}");
            }

            // 守卫抽牌
            guardCard = deckManager.DrawCard();
            if (guardCard == null)
            {
                Debug.LogError("[GameManager] 牌库耗尽！");
                EndGame();
                return;
            }

            Debug.Log($"[GameManager] 守卫牌: {guardCard} | {deckManager.GetStatusInfo()}");

            SetGameState(GameState.Playing);
            OnLevelStarted?.Invoke(currentLevel);

            // AI自动出牌（测试用）
            if (Application.isPlaying)
            {
                Invoke(nameof(AIPlayAll), 1f);
            }
        }

        /// <summary>
        /// AI玩家出牌
        /// </summary>
        private void AIPlayAll()
        {
            // 收集已出的牌
            var playedCardsList = new List<Card>(playedCards.Values);
            
            foreach (var player in players)
            {
                if (!playedCards.ContainsKey(player))
                {
                    Card card = player.AISelectCard(guardCard, playedCardsList);
                    if (card != null)
                    {
                        PlayCard(player, card);
                    }
                }
            }

            // 所有人出完牌后亮牌
            if (playedCards.Count >= players.Count)
            {
                Invoke(nameof(RevealAllCards), 0.5f);
            }
        }

        /// <summary>
        /// 玩家出牌
        /// </summary>
        public void PlayCard(Player player, Card card)
        {
            if (currentState != GameState.Playing)
            {
                Debug.LogWarning($"[GameManager] 当前状态 {currentState} 不能出牌");
                return;
            }

            if (playedCards.ContainsKey(player))
            {
                Debug.LogWarning($"[GameManager] {player.PlayerName} 已经出过牌了");
                return;
            }

            playedCards[player] = card;
            player.Hand.Remove(card);
            
            Debug.Log($"[GameManager] {player.PlayerName} 出牌: {card}");

            // 检查是否所有人都出完
            if (playedCards.Count >= players.Count)
            {
                RevealAllCards();
            }
        }

        /// <summary>
        /// 亮牌结算
        /// </summary>
        private void RevealAllCards()
        {
            SetGameState(GameState.Revealing);

            Debug.Log($"[GameManager] 亮牌！守卫牌: {guardCard}");

            foreach (var kvp in playedCards)
            {
                Player player = kvp.Key;
                Card card = kvp.Value;

                PlayResult result = DetermineResult(card);
                
                // 应用结果
                ApplyResult(player, result);

                // 触发事件
                OnCardRevealed?.Invoke(player, card, result);

                // 显示结果
                string resultStr = result switch
                {
                    PlayResult.Fail => "❌ 失败",
                    PlayResult.SuitMatch => "✅ 花色匹配，晋升！",
                    PlayResult.PerfectMatch => "✨ 完美匹配！晋升+天命卡",
                    _ => "?"
                };
                Debug.Log($"  {player.PlayerName}: {card} vs {guardCard} → {resultStr}");
            }

            // 检查是否有通关者
            Player winner = players.Find(p => p.CurrentLevel > maxLevels);
            if (winner != null)
            {
                OnPlayerWon?.Invoke(winner);
                Debug.Log($"🎉 {winner.PlayerName} 通关13层！");
                EndGame();
                return;
            }

            // 进入下一层
            SetGameState(GameState.LevelComplete);
            currentLevel++;
            
            Invoke(nameof(StartLevel), 2f);
        }

        /// <summary>
        /// 判定结果
        /// </summary>
        private PlayResult DetermineResult(Card playerCard)
        {
            if (playerCard.IsPerfectMatch(guardCard))
                return PlayResult.PerfectMatch;
            if (playerCard.MatchesSuit(guardCard))
                return PlayResult.SuitMatch;
            return PlayResult.Fail;
        }

        /// <summary>
        /// 应用结果
        /// </summary>
        private void ApplyResult(Player player, PlayResult result)
        {
            switch (result)
            {
                case PlayResult.SuitMatch:
                    player.CurrentLevel++;
                    player.TotalRises++;
                    player.Score += 20;
                    break;

                case PlayResult.PerfectMatch:
                    player.CurrentLevel++;
                    player.TotalRises++;
                    player.PerfectMatches++;
                    player.Score += 100;
                    
                    // 获得随机天命卡
                    DestinyCardType destiny = (DestinyCardType)UnityEngine.Random.Range(0, 11);
                    player.AddDestinyCard(destiny);
                    Debug.Log($"  {player.PlayerName} 获得天命卡: {destiny}");
                    break;

                case PlayResult.Fail:
                    // 停留本层，无惩罚
                    break;
            }
        }

        /// <summary>
        /// 设置游戏状态
        /// </summary>
        private void SetGameState(GameState newState)
        {
            currentState = newState;
            OnGameStateChanged?.Invoke(newState);
            Debug.Log($"[GameManager] 状态变更: {newState}");
        }

        /// <summary>
        /// 游戏结束
        /// </summary>
        private void EndGame()
        {
            SetGameState(GameState.GameOver);
            OnGameEnded?.Invoke();
            
            Debug.Log("[GameManager] 游戏结束");
            Debug.Log("===== 最终排名 =====");
            
            var sortedPlayers = new List<Player>(players);
            sortedPlayers.Sort((a, b) => b.CurrentLevel.CompareTo(a.CurrentLevel));
            
            for (int i = 0; i < sortedPlayers.Count; i++)
            {
                var p = sortedPlayers[i];
                Debug.Log($"{i + 1}. {p.PlayerName} - 第{p.CurrentLevel}层 | 积分:{p.Score} | 天命卡:{p.DestinyCards.Count}");
            }
        }
    }
}
