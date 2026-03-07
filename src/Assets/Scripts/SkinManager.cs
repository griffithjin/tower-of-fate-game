using UnityEngine;

namespace TowerOfFate
{
    /// <summary>
    /// 皮肤类型
    /// </summary>
    public enum SkinType
    {
        Oriental,   // 东方仙侠
        Fantasy,    // 欧美奇幻
        Cyberpunk,  // 赛博朋克
        Steampunk   // 蒸汽朋克
    }

    /// <summary>
    /// 皮肤数据
    /// </summary>
    [CreateAssetMenu(fileName = "NewSkin", menuName = "Tower of Fate/Skin")]
    public class SkinData : ScriptableObject
    {
        public SkinType skinType;
        public string skinName;
        public string description;
        public Sprite backgroundImage;
        public Sprite cardBackImage;
        public Color primaryColor = Color.white;
        public Color secondaryColor = Color.gray;
        public AudioClip backgroundMusic;
        public bool isUnlocked = true;
        public int price = 0; // 0 = 免费
    }

    /// <summary>
    /// 皮肤管理器
    /// </summary>
    public class SkinManager : MonoBehaviour
    {
        public static SkinManager Instance { get; private set; }

        [SerializeField] private SkinData currentSkin;
        [SerializeField] private SkinData[] allSkins;

        public SkinData CurrentSkin => currentSkin;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        /// <summary>
        /// 切换皮肤
        /// </summary>
        public void SetSkin(SkinType type)
        {
            SkinData skin = System.Array.Find(allSkins, s => s.skinType == type);
            if (skin != null && skin.isUnlocked)
            {
                currentSkin = skin;
                ApplySkin(skin);
                Debug.Log($"[SkinManager] 切换到皮肤: {skin.skinName}");
            }
        }

        /// <summary>
        /// 应用皮肤
        /// </summary>
        private void ApplySkin(SkinData skin)
        {
            // TODO: 应用皮肤到场景
            // - 更换背景
            // - 更换卡牌背面
            // - 更换UI颜色
            // - 播放背景音乐
        }

        /// <summary>
        /// 解锁皮肤
        /// </summary>
        public void UnlockSkin(SkinType type)
        {
            SkinData skin = System.Array.Find(allSkins, s => s.skinType == type);
            if (skin != null)
            {
                skin.isUnlocked = true;
                Debug.Log($"[SkinManager] 解锁皮肤: {skin.skinName}");
            }
        }
    }
}
