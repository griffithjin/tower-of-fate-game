using System.Collections.Generic;
using UnityEngine;
using TowerOfFate.AI;

namespace TowerOfFate
{
    /// <summary>
    /// 天命卡类型
    /// </summary>
    public enum DestinyCardType
    {
        AllRise,        // 全部可以上
        AllStay,        // 全部不能上
        BringOne,       // 允许带一位上
        KickOne,        // 允许踢一位下
        BringTwo,       // 允许带两位上
        KickTwo,        // 允许踢两位下
        BringThree,     // 允许带三位上
        KickThree,      // 允许踢三位下
        PeekNext,       // 查看下一层守卫出牌
        PeekDeck,       // 查看剩余牌库
        ForceSwap       // 强制换牌
    }

    /// <summary>
    /// 玩家类
    /// </summary>
    public class Player
    {
        public string PlayerId { get; private set; }
        public string PlayerName { get; private set; }
        public bool IsAI { get; private set; }
        
        public int CurrentLevel { get; set; } = 1;
        public List<Card> Hand { get; set; } = new List<Card>();
        public List<DestinyCardType> DestinyCards { get; private set; } = new List<DestinyCardType>();
        
        // 统计
        public int TotalRises { get; set; } = 0;
        public int PerfectMatches { get; set; } = 0;
        public int Score { get; set; } = 0;

        // AI策略
        private AIStrategy aiStrategy;

        public Player(string id, string name, bool isAI = true)
        {
            PlayerId = id;
            PlayerName = name;
            IsAI = isAI;
            
            if (isAI)
            {
                aiStrategy = new AIStrategy(this);
            }
        }

        /// <summary>
        /// AI选择出牌（智能策略）
        /// </summary>
        public Card AISelectCard(Card guardCard = null, List<Card> playedCards = null)
        {
            if (Hand.Count == 0) return null;
            
            if (aiStrategy != null && guardCard != null)
            {
                return aiStrategy.SelectCard(guardCard, playedCards ?? new List<Card>());
            }
            
            // 默认随机选择
            int index = Random.Range(0, Hand.Count);
            Card selected = Hand[index];
            return selected;
        }

        /// <summary>
        /// 添加天命卡
        /// </summary>
        public void AddDestinyCard(DestinyCardType card)
        {
            DestinyCards.Add(card);
        }

        /// <summary>
        /// 使用天命卡
        /// </summary>
        public bool UseDestinyCard(DestinyCardType card)
        {
            return DestinyCards.Remove(card);
        }

        public override string ToString()
        {
            return $"{PlayerName}[L{CurrentLevel}]";
        }
    }
}
