using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace TowerOfFate
{
    /// <summary>
    /// 花色枚举
    /// </summary>
    public enum Suit
    {
        Hearts,     // 红桃 ♥
        Diamonds,   // 方块 ♦
        Clubs,      // 梅花 ♣
        Spades      // 黑桃 ♠
    }

    /// <summary>
    /// 卡牌类
    /// </summary>
    [System.Serializable]
    public class Card
    {
        public Suit suit;
        public int rank; // 1-13, A=1, J=11, Q=12, K=13

        public Card(Suit suit, int rank)
        {
            this.suit = suit;
            this.rank = rank;
        }

        /// <summary>
        /// 花色匹配（晋升条件）
        /// </summary>
        public bool MatchesSuit(Card other)
        {
            return this.suit == other.suit;
        }

        /// <summary>
        /// 完美匹配（获得天命卡条件）
        /// </summary>
        public bool IsPerfectMatch(Card other)
        {
            return this.suit == other.suit && this.rank == other.rank;
        }

        public override string ToString()
        {
            string rankStr = rank switch
            {
                1 => "A",
                11 => "J",
                12 => "Q",
                13 => "K",
                _ => rank.ToString()
            };
            string suitStr = suit switch
            {
                Suit.Hearts => "♥",
                Suit.Diamonds => "♦",
                Suit.Clubs => "♣",
                Suit.Spades => "♠",
                _ => "?"
            };
            return $"{suitStr}{rankStr}";
        }
    }
}
