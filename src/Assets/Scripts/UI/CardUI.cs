using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System;

namespace TowerOfFate.UI
{
    /// <summary>
    /// 卡牌UI组件
    /// </summary>
    public class CardUI : MonoBehaviour
    {
        [SerializeField] private TextMeshProUGUI suitText;
        [SerializeField] private TextMeshProUGUI rankText;
        [SerializeField] private Image cardImage;
        [SerializeField] private Button cardButton;
        [SerializeField] private Color heartsColor = Color.red;
        [SerializeField] private Color diamondsColor = new Color(1f, 0.5f, 0f); // Orange
        [SerializeField] private Color clubsColor = Color.black;
        [SerializeField] private Color spadesColor = Color.black;

        private Card cardData;
        private Action<Card> onClickCallback;

        private void Awake()
        {
            if (cardButton != null)
                cardButton.onClick.AddListener(OnCardClicked);
        }

        public void Initialize(Card card, Action<Card> callback)
        {
            cardData = card;
            onClickCallback = callback;
            UpdateVisuals();
        }

        private void UpdateVisuals()
        {
            if (cardData == null) return;

            // 设置花色
            string suitStr = cardData.suit switch
            {
                Suit.Hearts => "♥",
                Suit.Diamonds => "♦",
                Suit.Clubs => "♣",
                Suit.Spades => "♠",
                _ => "?"
            };

            if (suitText != null)
            {
                suitText.text = suitStr;
                suitText.color = GetSuitColor(cardData.suit);
            }

            // 设置点数
            string rankStr = cardData.rank switch
            {
                1 => "A",
                11 => "J",
                12 => "Q",
                13 => "K",
                _ => cardData.rank.ToString()
            };

            if (rankText != null)
            {
                rankText.text = rankStr;
                rankText.color = GetSuitColor(cardData.suit);
            }

            // 设置卡片背景色
            if (cardImage != null)
            {
                cardImage.color = Color.white;
            }
        }

        private Color GetSuitColor(Suit suit)
        {
            return suit switch
            {
                Suit.Hearts => heartsColor,
                Suit.Diamonds => diamondsColor,
                Suit.Clubs => clubsColor,
                Suit.Spades => spadesColor,
                _ => Color.black
            };
        }

        private void OnCardClicked()
        {
            onClickCallback?.Invoke(cardData);
            
            // 视觉反馈
            transform.localScale = new Vector3(1.1f, 1.1f, 1f);
            Invoke(nameof(ResetScale), 0.1f);
        }

        private void ResetScale()
        {
            transform.localScale = Vector3.one;
        }
    }
}
