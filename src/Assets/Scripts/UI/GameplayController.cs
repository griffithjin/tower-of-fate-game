using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;

namespace TowerOfFate.UI
{
    /// <summary>
    /// 游戏界面控制器 - 快速实现版本
    /// </summary>
    public class GameplayController : MonoBehaviour
    {
        [Header("Game Info")]
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private TextMeshProUGUI timerText;
        [SerializeField] private TextMeshProUGUI deckInfoText;

        [Header("Guard Card")]
        [SerializeField] private GameObject guardCardPanel;
        [SerializeField] private TextMeshProUGUI guardCardText;
        [SerializeField] private Image guardCardImage;

        [Header("Player Panels")]
        [SerializeField] private List<PlayerGamePanel> playerPanels;

        [Header("Player Hand")]
        [SerializeField] private Transform handContainer;
        [SerializeField] private GameObject cardPrefab;
        [SerializeField] private Button playCardButton;
        [SerializeField] private TextMeshProUGUI selectedCardText;

        [Header("Result Panel")]
        [SerializeField] private GameObject resultPanel;
        [SerializeField] private TextMeshProUGUI resultText;

        private Card selectedCard;
        private List<CardUI> handCards = new List<CardUI>();

        private void Start()
        {
            InitializeGame();
            
            if (playCardButton != null)
                playCardButton.onClick.AddListener(OnPlayCard);
        }

        private void InitializeGame()
        {
            // 订阅游戏事件
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnLevelStarted += OnLevelStarted;
                GameManager.Instance.OnCardRevealed += OnCardRevealed;
                GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
            }

            // 开始游戏
            GameManager.Instance?.StartGame();
        }

        private void Update()
        {
            // 更新倒计时
            // TODO: 实现倒计时逻辑
        }

        private void OnLevelStarted(int level)
        {
            if (levelText != null)
                levelText.text = $"第 {level} 层";
            
            // 隐藏守卫牌
            if (guardCardPanel != null)
                guardCardPanel.SetActive(false);
            
            // 更新手牌显示
            UpdateHandDisplay();
        }

        private void OnCardRevealed(Player player, Card card, PlayResult result)
        {
            // 显示守卫牌
            if (guardCardPanel != null && !guardCardPanel.activeSelf)
            {
                guardCardPanel.SetActive(true);
                if (guardCardText != null)
                    guardCardText.text = $"守卫: {GameManager.Instance.GuardCard}";
            }

            // 显示结果
            ShowResult(result);
        }

        private void OnGameStateChanged(GameState state)
        {
            switch (state)
            {
                case GameState.Playing:
                    EnablePlayerInput(true);
                    break;
                case GameState.Revealing:
                    EnablePlayerInput(false);
                    break;
            }
        }

        private void UpdateHandDisplay()
        {
            // 清除旧手牌
            foreach (var card in handCards)
            {
                if (card != null)
                    Destroy(card.gameObject);
            }
            handCards.Clear();

            // 获取当前玩家手牌
            if (GameManager.Instance?.Players.Count > 0)
            {
                var player = GameManager.Instance.Players[0]; // 假设玩家是第1个
                
                foreach (var card in player.Hand)
                {
                    CreateCardUI(card);
                }
            }
        }

        private void CreateCardUI(Card card)
        {
            if (cardPrefab == null || handContainer == null) return;

            GameObject cardObj = Instantiate(cardPrefab, handContainer);
            CardUI cardUI = cardObj.GetComponent<CardUI>();
            
            if (cardUI != null)
            {
                cardUI.Initialize(card, OnCardSelected);
                handCards.Add(cardUI);
            }
        }

        private void OnCardSelected(Card card)
        {
            selectedCard = card;
            if (selectedCardText != null)
                selectedCardText.text = $"已选: {card}";
        }

        private void OnPlayCard()
        {
            if (selectedCard == null)
            {
                Debug.LogWarning("请先选择一张牌！");
                return;
            }

            // 出牌
            if (GameManager.Instance?.Players.Count > 0)
            {
                var player = GameManager.Instance.Players[0];
                GameManager.Instance.PlayCard(player, selectedCard);
                
                selectedCard = null;
                if (selectedCardText != null)
                    selectedCardText.text = "已选: 无";
            }
        }

        private void ShowResult(PlayResult result)
        {
            if (resultPanel != null)
                resultPanel.SetActive(true);
            
            string resultStr = result switch
            {
                PlayResult.Fail => "❌ 失败",
                PlayResult.SuitMatch => "✅ 花色匹配！",
                PlayResult.PerfectMatch => "✨ 完美匹配！",
                _ => "?"
            };
            
            if (resultText != null)
                resultText.text = resultStr;
            
            // 2秒后隐藏结果
            Invoke(nameof(HideResult), 2f);
        }

        private void HideResult()
        {
            if (resultPanel != null)
                resultPanel.SetActive(false);
        }

        private void EnablePlayerInput(bool enable)
        {
            if (playCardButton != null)
                playCardButton.interactable = enable;
        }

        public void OnBackToMainMenu()
        {
            UnityEngine.SceneManagement.SceneManager.LoadScene("MainMenu");
        }
    }
}
