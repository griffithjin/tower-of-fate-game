using UnityEngine;
using System;

namespace TowerOfFate.Core
{
    /// <summary>
    /// 玩家数据（可序列化）
    /// </summary>
    [Serializable]
    public class PlayerData
    {
        public string PlayerId;
        public string PlayerName;
        public int CurrentScore = 0;
        public int TotalScore = 0;
        public int CurrentLevel = 1;
        public RankTier CurrentRank = RankTier.Bronze;
        public int RankLevel = 1;
        
        // 统计
        public int TotalGames = 0;
        public int Wins = 0;
        public int PerfectMatches = 0;
        public int DestinyCardsCollected = 0;
        
        // 设置
        public string SelectedSkin = "Oriental";
        public float BGMVolume = 0.7f;
        public float SFXVolume = 1.0f;
        
        // 解锁内容
        public string[] UnlockedSkins = new string[] { "Oriental" };
        public string[] UnlockedDestinyCards = new string[0];
    }

    /// <summary>
    /// 存档管理器
    /// </summary>
    public class SaveManager : MonoBehaviour
    {
        public static SaveManager Instance { get; private set; }

        public PlayerData CurrentPlayer { get; private set; }

        private const string SAVE_KEY = "TowerOfFate_PlayerData";

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            LoadData();
        }

        /// <summary>
        /// 创建新玩家
        /// </summary>
        public void CreateNewPlayer(string playerName)
        {
            CurrentPlayer = new PlayerData
            {
                PlayerId = System.Guid.NewGuid().ToString(),
                PlayerName = playerName,
                CurrentScore = 0,
                CurrentRank = RankTier.Bronze,
                RankLevel = 1
            };
            
            SaveData();
            Debug.Log($"[SaveManager] 创建新玩家: {playerName}");
        }

        /// <summary>
        /// 保存数据
        /// </summary>
        public void SaveData()
        {
            if (CurrentPlayer == null) return;

            string json = JsonUtility.ToJson(CurrentPlayer);
            PlayerPrefs.SetString(SAVE_KEY, json);
            PlayerPrefs.Save();
            
            Debug.Log("[SaveManager] 数据已保存");
        }

        /// <summary>
        /// 加载数据
        /// </summary>
        public void LoadData()
        {
            if (PlayerPrefs.HasKey(SAVE_KEY))
            {
                string json = PlayerPrefs.GetString(SAVE_KEY);
                CurrentPlayer = JsonUtility.FromJson<PlayerData>(json);
                Debug.Log($"[SaveManager] 加载玩家数据: {CurrentPlayer?.PlayerName}");
            }
            else
            {
                Debug.Log("[SaveManager] 未找到存档数据");
            }
        }

        /// <summary>
        /// 更新积分
        /// </summary>
        public void AddScore(int score)
        {
            if (CurrentPlayer == null) return;

            CurrentPlayer.CurrentScore += score;
            CurrentPlayer.TotalScore += score;
            
            // 检查段位升级
            var rankSystem = new RankSystem();
            var (newRank, newLevel) = rankSystem.CalculateRank(CurrentPlayer.TotalScore);
            
            if (newRank != CurrentPlayer.CurrentRank || newLevel != CurrentPlayer.RankLevel)
            {
                CurrentPlayer.CurrentRank = newRank;
                CurrentPlayer.RankLevel = newLevel;
                Debug.Log($"🎉 段位提升: {newRank} {newLevel}级");
            }
            
            SaveData();
        }

        /// <summary>
        /// 解锁皮肤
        /// </summary>
        public void UnlockSkin(string skinName)
        {
            if (CurrentPlayer == null) return;

            var skins = new System.Collections.Generic.List<string>(CurrentPlayer.UnlockedSkins);
            if (!skins.Contains(skinName))
            {
                skins.Add(skinName);
                CurrentPlayer.UnlockedSkins = skins.ToArray();
                SaveData();
                Debug.Log($"[SaveManager] 解锁皮肤: {skinName}");
            }
        }

        /// <summary>
        /// 设置当前皮肤
        /// </summary>
        public void SetCurrentSkin(string skinName)
        {
            if (CurrentPlayer == null) return;

            if (System.Array.Exists(CurrentPlayer.UnlockedSkins, s => s == skinName))
            {
                CurrentPlayer.SelectedSkin = skinName;
                SaveData();
            }
        }

        /// <summary>
        /// 删除存档
        /// </summary>
        public void DeleteSave()
        {
            PlayerPrefs.DeleteKey(SAVE_KEY);
            CurrentPlayer = null;
            Debug.Log("[SaveManager] 存档已删除");
        }
    }
}
