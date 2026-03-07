using UnityEngine;
using System.Collections.Generic;

namespace TowerOfFate.Core
{
    /// <summary>
    /// 音效管理器
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        [Header("Audio Sources")]
        [SerializeField] private AudioSource bgmSource;
        [SerializeField] private AudioSource sfxSource;
        [SerializeField] private AudioSource uiSource;

        [Header("Audio Clips - BGM")]
        [SerializeField] private AudioClip mainMenuBGM;
        [SerializeField] private AudioClip gameplayBGM;
        [SerializeField] private AudioClip victoryBGM;
        [SerializeField] private AudioClip defeatBGM;

        [Header("Audio Clips - SFX")]
        [SerializeField] private AudioClip cardSelectSFX;
        [SerializeField] private AudioClip cardPlaySFX;
        [SerializeField] private AudioClip suitMatchSFX;
        [SerializeField] private AudioClip perfectMatchSFX;
        [SerializeField] private AudioClip failSFX;
        [SerializeField] private AudioClip levelUpSFX;
        [SerializeField] private AudioClip destinyCardSFX;
        [SerializeField] private AudioClip buttonClickSFX;

        // 音量设置
        private float bgmVolume = 0.7f;
        private float sfxVolume = 1.0f;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            LoadVolumeSettings();
        }

        /// <summary>
        /// 播放背景音乐
        /// </summary>
        public void PlayBGM(AudioClip clip, bool loop = true)
        {
            if (bgmSource.clip == clip) return;

            bgmSource.clip = clip;
            bgmSource.loop = loop;
            bgmSource.volume = bgmVolume;
            bgmSource.Play();
        }

        /// <summary>
        /// 播放主菜单BGM
        /// </summary>
        public void PlayMainMenuBGM()
        {
            PlayBGM(mainMenuBGM);
        }

        /// <summary>
        /// 播放游戏BGM
        /// </summary>
        public void PlayGameplayBGM()
        {
            PlayBGM(gameplayBGM);
        }

        /// <summary>
        /// 播放音效
        /// </summary>
        public void PlaySFX(AudioClip clip)
        {
            sfxSource.PlayOneShot(clip, sfxVolume);
        }

        /// <summary>
        /// 播放UI音效
        /// </summary>
        public void PlayUISFX(AudioClip clip)
        {
            uiSource.PlayOneShot(clip, sfxVolume);
        }

        // 快捷方法
        public void PlayCardSelect() => PlaySFX(cardSelectSFX);
        public void PlayCardPlay() => PlaySFX(cardPlaySFX);
        public void PlaySuitMatch() => PlaySFX(suitMatchSFX);
        public void PlayPerfectMatch() => PlaySFX(perfectMatchSFX);
        public void PlayFail() => PlaySFX(failSFX);
        public void PlayLevelUp() => PlaySFX(levelUpSFX);
        public void PlayDestinyCard() => PlaySFX(destinyCardSFX);
        public void PlayButtonClick() => PlayUISFX(buttonClickSFX);

        /// <summary>
        /// 设置BGM音量
        /// </summary>
        public void SetBGMVolume(float volume)
        {
            bgmVolume = Mathf.Clamp01(volume);
            bgmSource.volume = bgmVolume;
            PlayerPrefs.SetFloat("BGMVolume", bgmVolume);
        }

        /// <summary>
        /// 设置SFX音量
        /// </summary>
        public void SetSFXVolume(float volume)
        {
            sfxVolume = Mathf.Clamp01(volume);
            PlayerPrefs.SetFloat("SFXVolume", sfxVolume);
        }

        /// <summary>
        /// 加载音量设置
        /// </summary>
        private void LoadVolumeSettings()
        {
            bgmVolume = PlayerPrefs.GetFloat("BGMVolume", 0.7f);
            sfxVolume = PlayerPrefs.GetFloat("SFXVolume", 1.0f);
            
            bgmSource.volume = bgmVolume;
        }
    }
}
