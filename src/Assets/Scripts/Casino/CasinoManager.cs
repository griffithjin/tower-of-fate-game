using UnityEngine;
using System;
using System.Collections.Generic;

namespace TowerOfFate.Casino
{
    /// <summary>
    /// 代币类型
    /// </summary>
    public enum TokenType
    {
        Silver,     // 白银币 - 基础货币
        Gold,       // 黄金币 - 高级货币
        Diamond     // 钻石 - 充值货币
    }

    /// <summary>
    /// 投注类型
    /// </summary>
    public enum BetType
    {
        PerGame,        // 每局投注
        PerLevel,       // 每层投注
        Tournament,     // 锦标赛报名
        RankedMatch     // 排位赛
    }

    /// <summary>
    /// 结算结果
    /// </summary>
    public enum SettlementResult
    {
        Win,        // 获胜
        Loss,       // 失败
        Draw,       // 平局
        Refund      // 退款
    }

    /// <summary>
    /// 玩家钱包
    /// </summary>
    [Serializable]
    public class PlayerWallet
    {
        public long SilverCoins;
        public long GoldCoins;
        public long Diamonds;

        public long GetBalance(TokenType type)
        {
            return type switch
            {
                TokenType.Silver => SilverCoins,
                TokenType.Gold => GoldCoins,
                TokenType.Diamond => Diamonds,
                _ => 0
            };
        }

        public bool Deduct(TokenType type, long amount)
        {
            long balance = GetBalance(type);
            if (balance < amount) return false;

            switch (type)
            {
                case TokenType.Silver: SilverCoins -= amount; break;
                case TokenType.Gold: GoldCoins -= amount; break;
                case TokenType.Diamond: Diamonds -= amount; break;
            }
            return true;
        }

        public void Add(TokenType type, long amount)
        {
            switch (type)
            {
                case TokenType.Silver: SilverCoins += amount; break;
                case TokenType.Gold: GoldCoins += amount; break;
                case TokenType.Diamond: Diamonds += amount; break;
            }
        }
    }

    /// <summary>
    /// 投注记录
    /// </summary>
    [Serializable]
    public class BetRecord
    {
        public string BetId;
        public string PlayerId;
        public BetType Type;
        public TokenType TokenType;
        public long Amount;
        public DateTime BetTime;
        public bool IsSettled;
        public SettlementResult? Result;
        public long? WinAmount;
    }

    /// <summary>
    /// 赌场系统管理器
    /// </summary>
    public class CasinoManager : MonoBehaviour
    {
        public static CasinoManager Instance { get; private set; }

        [Header("Betting Settings")]
        [SerializeField] private long minBetAmount = 100;
        [SerializeField] private long maxBetAmount = 1000000;
        [SerializeField] private float houseEdge = 0.05f; // 5% 手续费

        // 玩家钱包
        private Dictionary<string, PlayerWallet> wallets = new Dictionary<string, PlayerWallet>();
        
        // 当前投注
        private Dictionary<string, BetRecord> currentBets = new Dictionary<string, BetRecord>();
        
        // 投注历史
        private List<BetRecord> betHistory = new List<BetRecord>();

        // 事件
        public event Action<string, PlayerWallet> OnWalletUpdated;
        public event Action<BetRecord> OnBetPlaced;
        public event Action<BetRecord> OnBetSettled;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        #region 钱包管理

        /// <summary>
        /// 初始化玩家钱包
        /// </summary>
        public void InitializeWallet(string playerId, long startingSilver = 5000, long startingGold = 100)
        {
            if (!wallets.ContainsKey(playerId))
            {
                wallets[playerId] = new PlayerWallet
                {
                    SilverCoins = startingSilver,
                    GoldCoins = startingGold,
                    Diamonds = 0
                };
                
                Debug.Log($"[CasinoManager] 初始化钱包: {playerId}, 白银币:{startingSilver}, 黄金币:{startingGold}");
            }
        }

        /// <summary>
        /// 获取玩家钱包
        /// </summary>
        public PlayerWallet GetWallet(string playerId)
        {
            if (!wallets.ContainsKey(playerId))
            {
                InitializeWallet(playerId);
            }
            return wallets[playerId];
        }

        /// <summary>
        /// 充值 (钻石购买)
        /// </summary>
        public void PurchaseDiamonds(string playerId, int diamondAmount, string transactionId)
        {
            var wallet = GetWallet(playerId);
            wallet.Diamonds += diamondAmount;
            
            Debug.Log($"[CasinoManager] 充值成功: {playerId} 获得{diamondAmount}钻石，订单:{transactionId}");
            OnWalletUpdated?.Invoke(playerId, wallet);
        }

        /// <summary>
        /// 货币兑换
        /// </summary>
        public bool ExchangeCurrency(string playerId, TokenType from, TokenType to, long amount)
        {
            var wallet = GetWallet(playerId);
            
            // 汇率
            var rates = new Dictionary<(TokenType, TokenType), float>
            {
                {(TokenType.Diamond, TokenType.Gold), 10f},
                {(TokenType.Gold, TokenType.Silver), 100f},
                {(TokenType.Diamond, TokenType.Silver), 1000f}
            };

            var key = (from, to);
            if (!rates.ContainsKey(key)) return false;

            if (!wallet.Deduct(from, amount)) return false;

            long receivedAmount = (long)(amount * rates[key]);
            wallet.Add(to, receivedAmount);

            Debug.Log($"[CasinoManager] 兑换: {amount} {from} → {receivedAmount} {to}");
            OnWalletUpdated?.Invoke(playerId, wallet);
            return true;
        }

        #endregion

        #region 投注系统

        /// <summary>
        /// 下注
        /// </summary>
        public bool PlaceBet(string playerId, BetType betType, TokenType tokenType, long amount)
        {
            // 验证金额
            if (amount < minBetAmount || amount > maxBetAmount)
            {
                Debug.LogWarning($"[CasinoManager] 投注金额无效: {amount}");
                return false;
            }

            var wallet = GetWallet(playerId);
            
            // 扣除押金
            if (!wallet.Deduct(tokenType, amount))
            {
                Debug.LogWarning($"[CasinoManager] 余额不足: {playerId}");
                return false;
            }

            // 创建投注记录
            var bet = new BetRecord
            {
                BetId = GenerateBetId(),
                PlayerId = playerId,
                Type = betType,
                TokenType = tokenType,
                Amount = amount,
                BetTime = DateTime.Now,
                IsSettled = false
            };

            currentBets[playerId] = bet;
            betHistory.Add(bet);

            Debug.Log($"[CasinoManager] 投注成功: {playerId} 下注 {amount} {tokenType}");
            OnWalletUpdated?.Invoke(playerId, wallet);
            OnBetPlaced?.Invoke(bet);
            
            return true;
        }

        /// <summary>
        /// 结算投注
        /// </summary>
        public void SettleBet(string playerId, SettlementResult result, float multiplier = 0)
        {
            if (!currentBets.TryGetValue(playerId, out var bet))
            {
                Debug.LogWarning($"[CasinoManager] 未找到投注记录: {playerId}");
                return;
            }

            bet.IsSettled = true;
            bet.Result = result;

            var wallet = GetWallet(playerId);
            long winAmount = 0;

            switch (result)
            {
                case SettlementResult.Win:
                    // 计算奖金 (扣除手续费)
                    winAmount = (long)(bet.Amount * multiplier * (1 - houseEdge));
                    wallet.Add(bet.TokenType, bet.Amount + winAmount);
                    Debug.Log($"[CasinoManager] 结算-获胜: {playerId} 获得 {winAmount} {bet.TokenType}");
                    break;

                case SettlementResult.Loss:
                    Debug.Log($"[CasinoManager] 结算-失败: {playerId} 失去 {bet.Amount} {bet.TokenType}");
                    break;

                case SettlementResult.Draw:
                    // 退还本金
                    wallet.Add(bet.TokenType, bet.Amount);
                    Debug.Log($"[CasinoManager] 结算-平局: {playerId} 退还本金");
                    break;

                case SettlementResult.Refund:
                    wallet.Add(bet.TokenType, bet.Amount);
                    Debug.Log($"[CasinoManager] 结算-退款: {playerId} 退还 {bet.Amount}");
                    break;
            }

            bet.WinAmount = winAmount;
            currentBets.Remove(playerId);

            OnWalletUpdated?.Invoke(playerId, wallet);
            OnBetSettled?.Invoke(bet);
        }

        /// <summary>
        /// 批量结算 (游戏结束)
        /// </summary>
        public void SettleGame(List<string> playerIds, List<int> rankings)
        {
            Debug.Log($"[CasinoManager] 游戏结算: {playerIds.Count} 位玩家");

            for (int i = 0; i < playerIds.Count; i++)
            {
                var playerId = playerIds[i];
                var rank = rankings[i];

                // 根据排名计算奖励倍数
                float multiplier = rank switch
                {
                    1 => 3.0f,  // 冠军 3倍
                    2 => 1.5f,  // 亚军 1.5倍
                    3 => 0.8f,  // 季军 0.8倍 (亏)
                    _ => 0f     // 其他 0
                };

                if (currentBets.ContainsKey(playerId))
                {
                    SettleBet(playerId, rank <= 2 ? SettlementResult.Win : SettlementResult.Loss, multiplier);
                }
            }
        }

        /// <summary>
        /// 取消投注
        /// </summary>
        public void CancelBet(string playerId)
        {
            SettleBet(playerId, SettlementResult.Refund);
        }

        #endregion

        #region 每日奖励

        /// <summary>
        /// 领取每日登录奖励
        /// </summary>
        public void ClaimDailyReward(string playerId)
        {
            var wallet = GetWallet(playerId);
            
            // 每日基础奖励
            long dailySilver = 1000;
            wallet.SilverCoins += dailySilver;
            
            Debug.Log($"[CasinoManager] 每日奖励: {playerId} 获得 {dailySilver} 白银币");
            OnWalletUpdated?.Invoke(playerId, wallet);
        }

        /// <summary>
        /// 连胜奖励
        /// </summary>
        public void GiveWinStreakBonus(string playerId, int streakCount)
        {
            var wallet = GetWallet(playerId);
            
            long bonus = streakCount switch
            {
                3 => 500,
                5 => 1500,
                10 => 5000,
                _ => 100
            };

            wallet.SilverCoins += bonus;
            Debug.Log($"[CasinoManager] 连胜奖励: {playerId} 连胜{streakCount}场，获得 {bonus} 白银币");
            OnWalletUpdated?.Invoke(playerId, wallet);
        }

        #endregion

        #region 数据持久化

        /// <summary>
        /// 保存数据
        /// </summary>
        public void SaveData()
        {
            foreach (var kvp in wallets)
            {
                string key = $"Wallet_{kvp.Key}";
                string json = JsonUtility.ToJson(kvp.Value);
                PlayerPrefs.SetString(key, json);
            }
            PlayerPrefs.Save();
            Debug.Log("[CasinoManager] 钱包数据已保存");
        }

        /// <summary>
        /// 加载数据
        /// </summary>
        public void LoadData(string playerId)
        {
            string key = $"Wallet_{playerId}";
            if (PlayerPrefs.HasKey(key))
            {
                string json = PlayerPrefs.GetString(key);
                var wallet = JsonUtility.FromJson<PlayerWallet>(json);
                wallets[playerId] = wallet;
                Debug.Log($"[CasinoManager] 加载钱包: {playerId}");
            }
        }

        #endregion

        private string GenerateBetId()
        {
            return $"BET{DateTime.Now:yyyyMMddHHmmss}{UnityEngine.Random.Range(1000, 9999)}";
        }
    }
}
