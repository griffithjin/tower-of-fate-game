using UnityEngine;
using System.Collections.Generic;
using System.IO;

namespace TowerOfFate.Build
{
    /// <summary>
    /// 构建配置
    /// </summary>
    public class BuildConfig
    {
        public string Version = "0.1.0";
        public string BuildNumber = "1";
        public string ProductName = "命运之塔";
        public string CompanyName = "TowerOfFate";
        public string BundleIdentifier = "com.toweroffate.game";
        public bool DevelopmentBuild = false;
        public bool IsCasinoVersion = true;
    }

    /// <summary>
    /// 构建自动化工具
    /// </summary>
    public class BuildAutomation : MonoBehaviour
    {
        [Header("Build Settings")]
        [SerializeField] private BuildConfig config = new BuildConfig();
        
        [Header("Scenes")]
        [SerializeField] private List<string> scenePaths = new List<string>
        {
            "Assets/Scenes/MainMenu.unity",
            "Assets/Scenes/Gameplay.unity"
        };

        [Header("Output")]
        [SerializeField] private string outputPath = "Builds";

        /// <summary>
        /// 构建Windows版本
        /// </summary>
        [ContextMenu("🔨 Build Windows")]
        public void BuildWindows()
        {
            string path = Path.Combine(outputPath, "Windows", $"TowerOfFate_v{config.Version}.exe");
            
            UnityEditor.BuildPipeline.BuildPlayer(
                scenePaths.ToArray(),
                path,
                UnityEditor.BuildTarget.StandaloneWindows64,
                config.DevelopmentBuild ? UnityEditor.BuildOptions.Development : UnityEditor.BuildOptions.None
            );
            
            Debug.Log($"✅ Windows构建完成: {path}");
        }

        /// <summary>
        /// 构建Android版本
        /// </summary>
        [ContextMenu("🔨 Build Android")]
        public void BuildAndroid()
        {
            string path = Path.Combine(outputPath, "Android", $"TowerOfFate_v{config.Version}.apk");
            
            UnityEditor.BuildPipeline.BuildPlayer(
                scenePaths.ToArray(),
                path,
                UnityEditor.BuildTarget.Android,
                config.DevelopmentBuild ? UnityEditor.BuildOptions.Development : UnityEditor.BuildOptions.None
            );
            
            Debug.Log($"✅ Android构建完成: {path}");
        }

        /// <summary>
        /// 构建WebGL版本
        /// </summary>
        [ContextMenu("🔨 Build WebGL")]
        public void BuildWebGL()
        {
            string path = Path.Combine(outputPath, "WebGL", $"TowerOfFate_v{config.Version}");
            
            UnityEditor.BuildPipeline.BuildPlayer(
                scenePaths.ToArray(),
                path,
                UnityEditor.BuildTarget.WebGL,
                config.DevelopmentBuild ? UnityEditor.BuildOptions.Development : UnityEditor.BuildOptions.None
            );
            
            Debug.Log($"✅ WebGL构建完成: {path}");
        }

        /// <summary>
        /// 一键构建所有平台
        /// </summary>
        [ContextMenu("🔨 Build All Platforms")]
        public void BuildAll()
        {
            Debug.Log("🚀 开始全平台构建...");
            
            BuildWindows();
            BuildAndroid();
            BuildWebGL();
            
            Debug.Log("🎉 全平台构建完成！");
        }

        /// <summary>
        /// 清理构建目录
        /// </summary>
        [ContextMenu("🧹 Clean Build Folder")]
        public void CleanBuildFolder()
        {
            if (Directory.Exists(outputPath))
            {
                Directory.Delete(outputPath, true);
                Debug.Log($"🧹 清理完成: {outputPath}");
            }
        }
    }
}
