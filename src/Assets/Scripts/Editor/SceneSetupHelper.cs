using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace TowerOfFate.Editor
{
    /// <summary>
    /// 场景快速设置工具 - 开发辅助
    /// </summary>
    public class SceneSetupHelper : MonoBehaviour
    {
        [ContextMenu("🔧 快速设置游戏场景")]
        public void QuickSetupGameplayScene()
        {
            // 创建GameManager
            var gm = FindObjectOfType<GameManager>();
            if (gm == null)
            {
                GameObject gmObj = new GameObject("GameManager");
                gmObj.AddComponent<GameManager>();
                Debug.Log("✅ 创建 GameManager");
            }

            // 创建AudioManager
            var am = FindObjectOfType<AudioManager>();
            if (am == null)
            {
                GameObject amObj = new GameObject("AudioManager");
                amObj.AddComponent<AudioManager>();
                Debug.Log("✅ 创建 AudioManager");
            }

            // 创建Canvas
            var canvas = FindObjectOfType<Canvas>();
            if (canvas == null)
            {
                GameObject canvasObj = new GameObject("Canvas");
                canvas = canvasObj.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                canvasObj.AddComponent<CanvasScaler>();
                canvasObj.AddComponent<GraphicRaycaster>();
                Debug.Log("✅ 创建 Canvas");
            }

            // 创建EventSystem
            if (FindObjectOfType<UnityEngine.EventSystems.EventSystem>() == null)
            {
                GameObject esObj = new GameObject("EventSystem");
                esObj.AddComponent<UnityEngine.EventSystems.EventSystem>();
                esObj.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
                Debug.Log("✅ 创建 EventSystem");
            }

            Debug.Log("🎮 场景基础设置完成！请继续设置UI元素。");
        }

        [ContextMenu("🎮 测试游戏启动")]
        public void TestGameStart()
        {
            var gm = FindObjectOfType<GameManager>();
            if (gm != null)
            {
                gm.StartGame();
                Debug.Log("🎮 游戏已启动！");
            }
            else
            {
                Debug.LogError("❌ 未找到GameManager，请先运行场景设置");
            }
        }
    }
}
