using UnityEngine;

namespace TowerOfFate.Editor
{
    /// <summary>
    /// 编辑器工具 - 快速创建游戏对象
    /// </summary>
    public class GameObjectFactory
    {
        #if UNITY_EDITOR
        
        [UnityEditor.MenuItem("Tower of Fate/Create/Main Camera")]
        public static void CreateMainCamera()
        {
            GameObject camera = new GameObject("Main Camera");
            Camera cam = camera.AddComponent<Camera>();
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.1f, 0.1f, 0.15f);
            cam.orthographic = true;
            cam.orthographicSize = 5.4f;
            camera.AddComponent<AudioListener>();
            camera.tag = "MainCamera";
            
            UnityEditor.Selection.activeGameObject = camera;
        }

        [UnityEditor.MenuItem("Tower of Fate/Create/Canvas")]
        public static void CreateCanvas()
        {
            GameObject canvasGO = new GameObject("Canvas");
            Canvas canvas = canvasGO.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 0;
            
            CanvasScaler scaler = canvasGO.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0.5f;
            
            canvasGO.AddComponent<GraphicRaycaster>();
            
            // 创建EventSystem
            if (GameObject.Find("EventSystem") == null)
            {
                GameObject eventSystem = new GameObject("EventSystem");
                eventSystem.AddComponent<UnityEngine.EventSystems.EventSystem>();
                eventSystem.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
            }
            
            UnityEditor.Selection.activeGameObject = canvasGO;
        }

        [UnityEditor.MenuItem("Tower of Fate/Create/GameManager")]
        public static void CreateGameManager()
        {
            GameObject go = new GameObject("GameManager");
            // 假设GameManager脚本已存在
            // go.AddComponent<GameManager>();
            
            UnityEditor.Selection.activeGameObject = go;
        }

        #endif
    }
}
