using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace TowerOfFate.UI
{
    /// <summary>
    /// 游戏内的玩家面板
    /// </summary>
    public class PlayerGamePanel : MonoBehaviour
    {
        [SerializeField] private TextMeshProUGUI playerNameText;
        [SerializeField] private TextMeshProUGUI playerLevelText;
        [SerializeField] private TextMeshProUGUI cardCountText;
        [SerializeField] private Image statusImage;
        [SerializeField] private Color normalColor = Color.white;
        [SerializeField] private Color activeColor = Color.yellow;
        [SerializeField] private Color winnerColor = Color.green;

        private Player playerData;

        public void SetPlayer(Player player)
        {
            playerData = player;
            UpdateDisplay();
        }

        public void UpdateDisplay()
        {
            if (playerData == null) return;

            if (playerNameText != null)
                playerNameText.text = playerData.PlayerName;

            if (playerLevelText != null)
                playerLevelText.text = $"第{playerData.CurrentLevel}层";

            if (cardCountText != null)
                cardCountText.text = $"{playerData.Hand.Count}张";
        }

        public void SetActivePlayer(bool isActive)
        {
            if (statusImage != null)
                statusImage.color = isActive ? activeColor : normalColor;
        }

        public void SetWinner()
        {
            if (statusImage != null)
                statusImage.color = winnerColor;
        }

        public void ShowPlayedCard(Card card, PlayResult result)
        {
            // 显示玩家出的牌和结果
            string resultStr = result switch
            {
                PlayResult.Fail => "❌",
                PlayResult.SuitMatch => "✅",
                PlayResult.PerfectMatch => "✨",
                _ => "?"
            };

            Debug.Log($"{playerData.PlayerName}: 出{card} - {resultStr}");
            UpdateDisplay();
        }
    }
}
