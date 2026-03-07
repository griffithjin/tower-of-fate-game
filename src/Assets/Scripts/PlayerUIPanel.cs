using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace TowerOfFate.UI
{
    /// <summary>
    /// 玩家UI面板
    /// </summary>
    public class PlayerUIPanel : MonoBehaviour
    {
        [SerializeField] private TextMeshProUGUI playerNameText;
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private TextMeshProUGUI handText;
        [SerializeField] private TextMeshProUGUI resultText;
        [SerializeField] private Image resultBackground;

        private Player currentPlayer;

        public void SetPlayer(Player player)
        {
            currentPlayer = player;
            
            if (playerNameText != null)
                playerNameText.text = player.PlayerName;
            
            UpdateDisplay();
        }

        public void UpdateDisplay()
        {
            if (currentPlayer == null) return;

            if (levelText != null)
                levelText.text = $"第{currentPlayer.CurrentLevel}层";

            if (handText != null)
                handText.text = $"手牌: {currentPlayer.Hand.Count}张";
        }

        public void ShowResult(Card card, PlayResult result)
        {
            string resultStr = result switch
            {
                PlayResult.Fail => "❌",
                PlayResult.SuitMatch => "✅ 晋升",
                PlayResult.PerfectMatch => "✨ 完美",
                _ => "?"
            };

            if (resultText != null)
            {
                resultText.text = $"{card} → {resultStr}";
            }

            if (resultBackground != null)
            {
                resultBackground.color = result switch
                {
                    PlayResult.Fail => Color.gray,
                    PlayResult.SuitMatch => Color.green,
                    PlayResult.PerfectMatch => Color.yellow,
                    _ => Color.white
                };
            }

            UpdateDisplay();
        }
    }
}
