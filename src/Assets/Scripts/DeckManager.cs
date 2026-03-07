using System.Collections.Generic;
using UnityEngine;

namespace TowerOfFate
{
    /// <summary>
    /// 牌库管理器（方案D：动态补充）
    /// </summary>
    public class DeckManager
    {
        private List<Card> deck = new List<Card>();
        private List<Card> discardPile = new List<Card>();

        public int RemainingCards => deck.Count;
        public int DiscardCount => discardPile.Count;

        /// <summary>
        /// 初始化52张牌
        /// </summary>
        public void Initialize()
        {
            deck.Clear();
            discardPile.Clear();

            foreach (Suit suit in System.Enum.GetValues(typeof(Suit)))
            {
                for (int rank = 1; rank <= 13; rank++)
                {
                    deck.Add(new Card(suit, rank));
                }
            }

            Shuffle();
            Debug.Log($"[DeckManager] 牌库初始化完成，共 {deck.Count} 张牌");
        }

        /// <summary>
        /// 洗牌
        /// </summary>
        public void Shuffle()
        {
            System.Random rng = new System.Random();
            int n = deck.Count;
            while (n > 1)
            {
                n--;
                int k = rng.Next(n + 1);
                (deck[k], deck[n]) = (deck[n], deck[k]);
            }
        }

        /// <summary>
        /// 抽牌
        /// </summary>
        public Card DrawCard()
        {
            if (deck.Count == 0)
            {
                RecycleDiscardPile();
            }

            if (deck.Count == 0)
            {
                Debug.LogError("[DeckManager] 牌库和弃牌堆都空了！");
                return null;
            }

            Card card = deck[deck.Count - 1];
            deck.RemoveAt(deck.Count - 1);
            return card;
        }

        /// <summary>
        /// 抽取手牌（5张）
        /// </summary>
        public List<Card> DrawHand(int count = 5)
        {
            List<Card> hand = new List<Card>();
            for (int i = 0; i < count; i++)
            {
                Card card = DrawCard();
                if (card != null)
                {
                    hand.Add(card);
                }
            }
            return hand;
        }

        /// <summary>
        /// 弃牌
        /// </summary>
        public void DiscardCards(List<Card> cards)
        {
            discardPile.AddRange(cards);
        }

        /// <summary>
        /// 回收弃牌堆
        /// </summary>
        private void RecycleDiscardPile()
        {
            if (discardPile.Count == 0) return;

            Debug.Log($"[DeckManager] 回收弃牌堆，共 {discardPile.Count} 张");
            deck.AddRange(discardPile);
            discardPile.Clear();
            Shuffle();
        }

        /// <summary>
        /// 获取牌库状态信息
        /// </summary>
        public string GetStatusInfo()
        {
            return $"牌库: {RemainingCards} | 弃牌: {DiscardCount}";
        }
    }
}
