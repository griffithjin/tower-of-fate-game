using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;

namespace TowerOfFate.UI
{
    /// <summary>
    /// UI管理器
    /// </summary>
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }

        [Header("Main UI")]
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private TextMeshProUGUI deckInfoText;
        [SerializeField] private TextMeshProUGUI gameStateText;

        [Header("Guard Card")]
        [SerializeField] private GameObject guardCardPanel;
        [SerializeField] private Image guardCardImage;
        [SerializeField] private TextMeshProUGUI guardCardText;

        [Header("Player Panels")]
        [SerializeField] private List<PlayerUIPanel> playerPanels;

        [Header("Buttons")]
        [SerializeField] private Button startGameButton;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        private void Start()
        {
            // 绑定按钮事件
            if (startGameButton != null)
            {
                startGameButton.onClick.AddListener(OnStartGameClicked);
            }

            // 订阅游戏事件
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
                GameManager.Instance.OnLevelStarted += OnLevelStarted;
                GameManager.Instance.OnCardRevealed += OnCardRevealed;
            }

            UpdateUI();
        }

        private void OnDestroy()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
                GameManager.Instance.OnLevelStarted -= OnLevelStarted;
                GameManager.Instance.OnCardRevealed -= OnCardRevealed;
            }
        }

        private void OnStartGameClicked()
        {
            GameManager.Instance?.StartGame();
            startGameButton.gameObject.SetActive(false);
        }

        private void OnGameStateChanged(GameState state)
        {
            gameStateText.text = $"状态: {GetStateText(state)}";
        }

        private void OnLevelStarted(int level)
        {
            levelText.text = $"第 {level} 层";
            
            // 隐藏守卫牌
            guardCardPanel?.SetActive(false);
            
            UpdateUI();
        }

        private void OnCardRevealed(Player player, Card card, PlayResult result)
        {
            // 显示守卫牌
            if (guardCardPanel != null && !guardCardPanel.activeSelf)
            {
                guardCardPanel.SetActive(true);
                if (guardCardText != null)
                {
                    guardCardText.text = $"守卫: {GameManager.Instance.GuardCard}";
                }
            }

            // 更新玩家面板
            int playerIndex = GameManager.Instance.Players.IndexOf(player);
            if (playerIndex >= 0 && playerIndex < playerPanels.Count)
            {
                playerPanels[playerIndex].ShowResult(card, result);
            }

            UpdateUI();
        }

        private void UpdateUI()
        {
            // 更新玩家面板
            for (int i = 0; i < playerPanels.Count; i++)
            {
                if (i < GameManager.Instance.Players.Count)
                {
                    playerPanels[i].SetPlayer(GameManager.Instance.Players[i]);
                }
            }
        }

        private string GetStateText(GameState state)
        {
            return state switch
            {
                GameState.Waiting => "等待中",
                GameState.Dealing => "发牌中",
                GameState.Playing => "请出牌",
                GameState.Revealing => "亮牌中",
                GameState.Resolving => "结算中",
                GameState.LevelComplete => "层完成",
                GameState.GameOver => "游戏结束",
                _ => "未知"
            };
        }
    }
}
