using UnityEngine;
using System.Collections.Generic;
using System.Linq;

namespace TowerOfFate.AI
{
    /// <summary>
    /// AI策略系统
    /// </summary>
    public class AIStrategy
    {
        private Player player;
        private Card guardCard;

        public AIStrategy(Player player)
        {
            this.player = player;
        }

        /// <summary>
        /// 选择出牌
        /// </summary>
        public Card SelectCard(Card guard, List<Card> playedCards)
        {
            this.guardCard = guard;
            
            if (player.Hand.Count == 0) return null;

            // 策略优先级：
            // 1. 如果有完美匹配的牌，优先出（获得天命卡）
            // 2. 如果有同花色的牌，次之（晋升）
            // 3. 否则出最小的牌保留大牌

            var perfectMatch = player.Hand.Find(c => c.IsPerfectMatch(guard));
            if (perfectMatch != null)
            {
                Debug.Log($"[{player.PlayerName}] AI策略: 出完美匹配牌 {perfectMatch}");
                return perfectMatch;
            }

            var suitMatch = player.Hand.Find(c => c.MatchesSuit(guard));
            if (suitMatch != null)
            {
                Debug.Log($"[{player.PlayerName}] AI策略: 出同花色牌 {suitMatch}");
                return suitMatch;
            }

            // 出最小的牌
            var minCard = player.Hand.OrderBy(c => c.rank).First();
            Debug.Log($"[{player.PlayerName}] AI策略: 出最小牌 {minCard}");
            return minCard;
        }

        /// <summary>
        /// 决定是否使用天命卡
        /// </summary>
        public bool ShouldUseDestinyCard(DestinyCardType card, GameState state)
        {
            // 简单策略：有就用
            return true;
        }
    }
}
