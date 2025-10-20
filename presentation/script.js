/**
 * 食材菜谱推荐系统 PPT 演示 - 核心交互脚本
 *
 * 功能:
 * 1. 幻灯片翻页控制(支持键盘、按钮导航)
 * 2. 深色/浅色模式切换(跟随系统设置)
 * 3. 进度条实时更新
 * 4. 响应式交互优化
 */

class PresentationController {
  /**
   * 初始化演示控制器
   */
  constructor() {
    // 幻灯片相关
    this.slides = document.querySelectorAll('.slide');
    this.totalSlides = this.slides.length;
    this.currentIndex = 0;

    // DOM 元素引用
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.currentSlideEl = document.getElementById('currentSlide');
    this.totalSlidesEl = document.getElementById('totalSlides');
    this.progressBar = document.getElementById('progressBar');
    this.themeToggle = document.getElementById('themeToggle');
    this.themeIcon = document.getElementById('themeIcon');

    // 主题设置
    this.isDark = false;

    // 初始化
    this.init();
  }

  /**
   * 初始化所有功能
   */
  init() {
    // 设置总页数
    this.totalSlidesEl.textContent = this.totalSlides;

    // 初始化主题(跟随系统设置)
    this.initTheme();

    // 绑定事件监听器
    this.bindEvents();

    // 显示第一页
    this.showSlide(0);
  }

  /**
   * 初始化主题模式(跟随系统设置)
   */
  initTheme() {
    // 检测系统主题偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 应用主题
    this.setTheme(prefersDark);

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.setTheme(e.matches);
    });
  }

  /**
   * 设置主题
   * @param {boolean} isDark - 是否为深色模式
   */
  setTheme(isDark) {
    this.isDark = isDark;

    if (isDark) {
      document.documentElement.classList.add('dark');
      this.themeIcon.textContent = '☀️';
    } else {
      document.documentElement.classList.remove('dark');
      this.themeIcon.textContent = '🌙';
    }
  }

  /**
   * 切换主题
   */
  toggleTheme() {
    this.setTheme(!this.isDark);
  }

  /**
   * 绑定所有事件监听器
   */
  bindEvents() {
    // 按钮点击事件
    this.prevBtn.addEventListener('click', () => this.prevSlide());
    this.nextBtn.addEventListener('click', () => this.nextSlide());
    this.themeToggle.addEventListener('click', () => this.toggleTheme());

    // 键盘事件
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          this.prevSlide();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ': // 空格键
          this.nextSlide();
          e.preventDefault(); // 防止空格键滚动页面
          break;
        case 'Home':
          this.goToSlide(0);
          break;
        case 'End':
          this.goToSlide(this.totalSlides - 1);
          break;
      }
    });

    // 触摸滑动支持(移动端)
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    });
  }

  /**
   * 处理触摸滑动
   * @param {number} startX - 起始X坐标
   * @param {number} endX - 结束X坐标
   */
  handleSwipe(startX, endX) {
    const swipeThreshold = 50; // 滑动阈值(像素)
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // 向左滑动 - 下一页
        this.nextSlide();
      } else {
        // 向右滑动 - 上一页
        this.prevSlide();
      }
    }
  }

  /**
   * 显示指定幻灯片
   * @param {number} index - 幻灯片索引
   */
  showSlide(index) {
    // 隐藏所有幻灯片
    this.slides.forEach((slide) => {
      slide.style.opacity = '0';
      slide.style.pointerEvents = 'none';
    });

    // 显示目标幻灯片
    this.slides[index].style.opacity = '1';
    this.slides[index].style.pointerEvents = 'auto';

    // 更新当前索引
    this.currentIndex = index;

    // 更新UI
    this.updateUI();
  }

  /**
   * 跳转到指定页面
   * @param {number} index - 目标页面索引
   */
  goToSlide(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.showSlide(index);
    }
  }

  /**
   * 上一页
   */
  prevSlide() {
    const newIndex = this.currentIndex - 1;
    if (newIndex >= 0) {
      this.showSlide(newIndex);
    }
  }

  /**
   * 下一页
   */
  nextSlide() {
    const newIndex = this.currentIndex + 1;
    if (newIndex < this.totalSlides) {
      this.showSlide(newIndex);
    }
  }

  /**
   * 更新UI元素(页码、进度条、按钮状态)
   */
  updateUI() {
    // 更新页码显示
    this.currentSlideEl.textContent = this.currentIndex + 1;

    // 更新进度条
    const progress = ((this.currentIndex + 1) / this.totalSlides) * 100;
    this.progressBar.style.width = `${progress}%`;

    // 更新按钮状态
    if (this.currentIndex === 0) {
      this.prevBtn.style.opacity = '0.5';
      this.prevBtn.style.cursor = 'not-allowed';
    } else {
      this.prevBtn.style.opacity = '1';
      this.prevBtn.style.cursor = 'pointer';
    }

    if (this.currentIndex === this.totalSlides - 1) {
      this.nextBtn.style.opacity = '0.5';
      this.nextBtn.style.cursor = 'not-allowed';
    } else {
      this.nextBtn.style.opacity = '1';
      this.nextBtn.style.cursor = 'pointer';
    }
  }
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 创建演示控制器实例
  const presentation = new PresentationController();

  // 全局暴露(方便调试)
  window.presentation = presentation;

  // 打印初始化信息
  console.log('🎨 食材菜谱推荐系统 PPT 已加载');
  console.log(`📊 共 ${presentation.totalSlides} 页幻灯片`);
  console.log('⌨️  键盘快捷键: ← → 翻页 | Home/End 跳转首尾');
});
