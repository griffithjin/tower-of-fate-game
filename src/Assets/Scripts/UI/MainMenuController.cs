using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace TowerOfFate.UI
{
    /// <summary>
    /// 主菜单控制器 - 快速实现版本
    /// </summary>
    public class MainMenuController : MonoBehaviour
    {
        [Header("Buttons")]
        [SerializeField] private Button startGameButton;
        [SerializeField] private Button multiplayerButton;
        [SerializeField] private Button shopButton;
        [SerializeField] private Button settingsButton;
        [SerializeField] private Button achievementsButton;
        [SerializeField] private Button leaderboardButton;
        [SerializeField] private Button friendsButton;

        [Header("UI Panels")]
        [SerializeField] private GameObject mainPanel;
        [SerializeField] private GameObject settingsPanel;
        [SerializeField] private GameObject shopPanel;

        [Header("Player Info")]
        [SerializeField] private TextMeshProUGUI playerNameText;
        [SerializeField] private TextMeshProUGUI playerRankText;
        [SerializeField] private TextMeshProUGUI playerScoreText;

        private void Start()
        {
            InitializeButtons();
            LoadPlayerInfo();
        }

        private void InitializeButtons()
        {
            if (startGameButton != null)
                startGameButton.onClick.AddListener(OnStartGame);
            
            if (multiplayerButton != null)
                multiplayerButton.onClick.AddListener(OnMultiplayer);
            
            if (shopButton != null)
                shopButton.onClick.AddListener(OnShop);
            
            if (settingsButton != null)
                settingsButton.onClick.AddListener(OnSettings);
            
            if (achievementsButton != null)
                achievementsButton.onClick.AddListener(OnAchievements);
            
            if (leaderboardButton != null)
                leaderboardButton.onClick.AddListener(OnLeaderboard);
            
            if (friendsButton != null)
                friendsButton.onClick.AddListener(OnFriends);
        }

        private void LoadPlayerInfo()
        {
            // 从存档加载玩家信息
            if (SaveManager.Instance != null && SaveManager.Instance.CurrentPlayer != null)
            {
                var player = SaveManager.Instance.CurrentPlayer;
                if (playerNameText != null)
                    playerNameText.text = player.PlayerName;
                if (playerRankText != null)
                    playerRankText.text = $"{player.CurrentRank} {player.RankLevel}";
                if (playerScoreText != null)
                    playerScoreText.text = $"积分: {player.CurrentScore}";
            }
            else
            {
                // 默认显示
                if (playerNameText != null)
                    playerNameText.text = "玩家";
                if (playerRankText != null)
                    playerRankText.text = "青铜 I";
                if (playerScoreText != null)
                    playerScoreText.text = "积分: 0";
            }
        }

        private void OnStartGame()
        {
            Debug.Log("🎮 开始游戏！");
            // 加载游戏场景
            UnityEngine.SceneManagement.SceneManager.LoadScene("Gameplay");
        }

        private void OnMultiplayer()
        {
            Debug.Log("👥 多人对战！");
            // 打开多人对战面板
        }

        private void OnShop()
        {
            Debug.Log("🛒 商店！");
            if (shopPanel != null)
                shopPanel.SetActive(true);
        }

        private void OnSettings()
        {
            Debug.Log("⚙️ 设置！");
            if (settingsPanel != null)
                settingsPanel.SetActive(true);
        }

        private void OnAchievements()
        {
            Debug.Log("🏆 成就！");
            // 打开成就面板
        }

        private void OnLeaderboard()
        {
            Debug.Log("📊 排行榜！");
            // 打开排行榜面板
        }

        private void OnFriends()
        {
            Debug.Log("👤 好友！");
            // 打开好友面板
        }

        public void OnBackToMain()
        {
            if (settingsPanel != null)
                settingsPanel.SetActive(false);
            if (shopPanel != null)
                shopPanel.SetActive(false);
            if (mainPanel != null)
                mainPanel.SetActive(true);
        }
    }
}
