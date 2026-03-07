using System;
using System.Collections.Generic;

namespace TowerOfFate
{
    /// <summary>
    /// 段位类型
    /// </summary>
    public enum RankTier
    {
        Bronze,     // 青铜
        Silver,     // 白银
        Gold,       // 黄金
        Platinum,   // 铂金
        Diamond,    // 钻石
        Star,       // 星耀
        King,       // 王者
        FirstFortune // 首位好运
    }

    /// <summary>
    /// 段位系统
    /// </summary>
    public class RankSystem
    {
        // 段位配置
        private readonly Dictionary<RankTier, RankConfig> rankConfigs = new Dictionary<RankTier, RankConfig>
        {
            { RankTier.Bronze, new RankConfig { Tier = RankTier.Bronze, Name = "青铜", MaxLevel = 13, ScoreRequired = 0, Icon = "🥉" } },
            { RankTier.Silver, new RankConfig { Tier = RankTier.Silver, Name = "白银", MaxLevel = 13, ScoreRequired = 5000, Icon = "🥈" } },
            { RankTier.Gold, new RankConfig { Tier = RankTier.Gold, Name = "黄金", MaxLevel = 13, ScoreRequired = 20000, Icon = "🥇" } },
            { RankTier.Platinum, new RankConfig { Tier = RankTier.Platinum, Name = "铂金", MaxLevel = 13, ScoreRequired = 50000, Icon = "💎" } },
            { RankTier.Diamond, new RankConfig { Tier = RankTier.Diamond, Name = "钻石", MaxLevel = 13, ScoreRequired = 100000, Icon = "💠" } },
            { RankTier.Star, new RankConfig { Tier = RankTier.Star, Name = "星耀", MaxLevel = 13, ScoreRequired = 200000, Icon = "⭐" } },
            { RankTier.King, new RankConfig { Tier = RankTier.King, Name = "王者", MaxLevel = 13, ScoreRequired = 500000, Icon = "👑" } },
            { RankTier.FirstFortune, new RankConfig { Tier = RankTier.FirstFortune, Name = "首位好运", MaxLevel = 1, ScoreRequired = 1000000, Icon = "🍀" } }
        };

        /// <summary>
        /// 计算玩家段位
        /// </summary>
        public (RankTier tier, int level) CalculateRank(int totalScore)
        {
            RankTier currentTier = RankTier.Bronze;
            
            foreach (var kvp in rankConfigs)
            {
                if (totalScore >= kvp.Value.ScoreRequired)
                {
                    currentTier = kvp.Key;
                }
                else
                {
                    break;
                }
            }

            // 计算当前段位内的等级
            int level = 1;
            if (currentTier != RankTier.FirstFortune)
            {
                int currentTierBaseScore = rankConfigs[currentTier].ScoreRequired;
                int nextTierScore = GetNextTierScore(currentTier);
                int tierRange = nextTierScore - currentTierBaseScore;
                int scoreInTier = totalScore - currentTierBaseScore;
                
                level = Math.Min(13, (scoreInTier * 13 / tierRange) + 1);
            }

            return (currentTier, level);
        }

        /// <summary>
        /// 获取段位配置
        /// </summary>
        public RankConfig GetRankConfig(RankTier tier)
        {
            return rankConfigs.ContainsKey(tier) ? rankConfigs[tier] : null;
        }

        /// <summary>
        /// 获取下一档段位所需积分
        /// </summary>
        private int GetNextTierScore(RankTier currentTier)
        {
            RankTier[] tiers = (RankTier[])Enum.GetValues(typeof(RankTier));
            int currentIndex = Array.IndexOf(tiers, currentTier);
            
            if (currentIndex < tiers.Length - 1)
            {
                return rankConfigs[tiers[currentIndex + 1]].ScoreRequired;
            }
            
            return int.MaxValue;
        }

        /// <summary>
        /// 计算积分获取
        /// </summary>
        public int CalculateScoreGain(ScoreEvent scoreEvent)
        {
            return scoreEvent switch
            {
                ScoreEvent.LevelComplete => 20,
                ScoreEvent.PerfectMatch => 100,
                ScoreEvent.DestinyCardReceived => 50,
                ScoreEvent.DestinyCardUsed => 80,
                ScoreEvent.Win => 500,
                ScoreEvent.TeamWin => 800,
                ScoreEvent.ThreeConsecutiveRises => 200,
                _ => 0
            };
        }
    }

    /// <summary>
    /// 段位配置
    /// </summary>
    public class RankConfig
    {
        public RankTier Tier { get; set; }
        public string Name { get; set; }
        public int MaxLevel { get; set; }
        public int ScoreRequired { get; set; }
        public string Icon { get; set; }
    }

    /// <summary>
    /// 积分事件类型
    /// </summary>
    public enum ScoreEvent
    {
        LevelComplete,
        PerfectMatch,
        DestinyCardReceived,
        DestinyCardUsed,
        Win,
        TeamWin,
        ThreeConsecutiveRises
    }
}
