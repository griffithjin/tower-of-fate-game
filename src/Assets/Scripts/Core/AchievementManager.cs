using UnityEngine;
using System;
using System.Collections.Generic;

namespace TowerOfFate.Core
{
    /// <summary>
    /// 成就类型
    /// </summary>
    public enum AchievementType
    {
        // 游戏次数
        FirstGame,          // 初次游戏
        NovicePlayer,       // 游戏10场
        ExperiencedPlayer,  // 游戏100场
        VeteranPlayer,      // 游戏1000场
        
        // 胜利
        FirstWin,           // 首胜
        WinningStreak3,     // 3连胜
        WinningStreak10,    // 10连胜
        
        // 完美匹配
        FirstPerfect,       // 首次完美匹配
        PerfectCollector,   // 完美匹配10次
        PerfectMaster,      // 完美匹配100次
        
        // 天命卡
        FirstDestiny,       // 首次获得天命卡
        DestinyCollector,   // 收集10张天命卡
        DestinyMaster,      // 收集100张天命卡
        
        // 段位
        ReachSilver,        // 达到白银
        ReachGold,          // 达到黄金
        ReachPlatinum,      // 达到铂金
        ReachDiamond,       // 达到钻石
        ReachStar,          // 达到星耀
        ReachKing,          // 达到王者
        ReachFirstFortune,  // 达到首位好运
        
        // 特殊
        SpeedRunner,        // 快速通关
        Collector,          // 收集所有皮肤
        SocialButterfly     // 添加10个好友
    }

    /// <summary>
    /// 成就数据
    /// </summary>
    [Serializable]
    public class Achievement
    {
        public AchievementType Type;
        public string Title;
        public string Description;
        public int RewardScore;
        public bool IsUnlocked;
        public DateTime UnlockTime;
    }

    /// <summary>
    /// 成就管理器
    /// </summary>
    public class AchievementManager : MonoBehaviour
    {
        public static AchievementManager Instance { get; private set; }

        // 成就列表
        private Dictionary<AchievementType, Achievement> achievements = new Dictionary<AchievementType, Achievement>();

        // 进度追踪
        private Dictionary<AchievementType, int> progress = new Dictionary<AchievementType, int>();

        // 事件
        public event Action<Achievement> OnAchievementUnlocked;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            InitializeAchievements();
        }

        /// <summary>
        /// 初始化成就
        /// </summary>
        private void InitializeAchievements()
        {
            // 游戏次数
            AddAchievement(AchievementType.FirstGame, "初次尝试", "完成第一场游戏", 50);
            AddAchievement(AchievementType.NovicePlayer, "新手玩家", "完成10场游戏", 100);
            AddAchievement(AchievementType.ExperiencedPlayer, "资深玩家", "完成100场游戏", 500);
            AddAchievement(AchievementType.VeteranPlayer, " veteran玩家", "完成1000场游戏", 2000);

            // 胜利
            AddAchievement(AchievementType.FirstWin, "首胜", "获得第一场胜利", 100);
            AddAchievement(AchievementType.WinningStreak3, "连战连胜", "获得3连胜", 200);
            AddAchievement(AchievementType.WinningStreak10, "不败神话", "获得10连胜", 1000);

            // 完美匹配
            AddAchievement(AchievementType.FirstPerfect, "完美一击", "首次完成完美匹配", 100);
            AddAchievement(AchievementType.PerfectCollector, "完美收藏家", "完成10次完美匹配", 300);
            AddAchievement(AchievementType.PerfectMaster, "完美大师", "完成100次完美匹配", 1500);

            // 天命卡
            AddAchievement(AchievementType.FirstDestiny, "命运之子", "首次获得天命卡", 50);
            AddAchievement(AchievementType.DestinyCollector, "命运收藏家", "收集10张天命卡", 200);
            AddAchievement(AchievementType.DestinyMaster, "命运主宰", "收集100张天命卡", 1000);

            // 段位
            AddAchievement(AchievementType.ReachSilver, "白银之光", "达到白银段位", 200);
            AddAchievement(AchievementType.ReachGold, "黄金荣耀", "达到黄金段位", 500);
            AddAchievement(AchievementType.ReachPlatinum, "铂金闪耀", "达到铂金段位", 1000);
            AddAchievement(AchievementType.ReachDiamond, "钻石璀璨", "达到钻石段位", 2000);
            AddAchievement(AchievementType.ReachStar, "星辰大海", "达到星耀段位", 5000);
            AddAchievement(AchievementType.ReachKing, "王者降临", "达到王者段位", 10000);
            AddAchievement(AchievementType.ReachFirstFortune, "首位好运", "达到首位好运段位", 50000);
        }

        /// <summary>
        /// 添加成就
        /// </summary>
        private void AddAchievement(AchievementType type, string title, string desc, int reward)
        {
            achievements[type] = new Achievement
            {
                Type = type,
                Title = title,
                Description = desc,
                RewardScore = reward,
                IsUnlocked = false
            };
            progress[type] = 0;
        }

        /// <summary>
        /// 更新进度
        /// </summary>
        public void UpdateProgress(AchievementType type, int value = 1)
        {
            if (!achievements.ContainsKey(type)) return;
            if (achievements[type].IsUnlocked) return;

            progress[type] += value;

            // 检查是否达成
            bool unlocked = false;
            switch (type)
            {
                case AchievementType.FirstGame:
                case AchievementType.FirstWin:
                case AchievementType.FirstPerfect:
                case AchievementType.FirstDestiny:
                    unlocked = progress[type] >= 1;
                    break;
                case AchievementType.NovicePlayer:
                case AchievementType.FirstDestiny + 1: // DestinyCollector
                    unlocked = progress[type] >= 10;
                    break;
                case AchievementType.WinningStreak3:
                    unlocked = progress[type] >= 3;
                    break;
                case AchievementType.ExperiencedPlayer:
                case AchievementType.PerfectCollector:
                case AchievementType.DestinyCollector:
                    unlocked = progress[type] >= 10;
                    break;
                case AchievementType.WinningStreak10:
                    unlocked = progress[type] >= 10;
                    break;
                case AchievementType.VeteranPlayer:
                case AchievementType.PerfectMaster:
                case AchievementType.DestinyMaster:
                    unlocked = progress[type] >= 100;
                    break;
            }

            if (unlocked)
            {
                UnlockAchievement(type);
            }
        }

        /// <summary>
        /// 直接解锁（用于段位类成就）
        /// </summary>
        public void UnlockAchievement(AchievementType type)
        {
            if (!achievements.ContainsKey(type)) return;
            if (achievements[type].IsUnlocked) return;

            achievements[type].IsUnlocked = true;
            achievements[type].UnlockTime = DateTime.Now;

            // 发放奖励
            if (SaveManager.Instance != null)
            {
                SaveManager.Instance.AddScore(achievements[type].RewardScore);
            }

            Debug.Log($"🎉 成就解锁: {achievements[type].Title}");
            OnAchievementUnlocked?.Invoke(achievements[type]);
        }

        /// <summary>
        /// 获取成就列表
        /// </summary>
        public List<Achievement> GetAllAchievements()
        {
            return new List<Achievement>(achievements.Values);
        }

        /// <summary>
        /// 获取已解锁成就
        /// </summary>
        public List<Achievement> GetUnlockedAchievements()
        {
            var list = new List<Achievement>();
            foreach (var kvp in achievements)
            {
                if (kvp.Value.IsUnlocked)
                    list.Add(kvp.Value);
            }
            return list;
        }
    }
}
