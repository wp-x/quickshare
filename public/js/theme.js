document.addEventListener('DOMContentLoaded', () => {
  // 检查本地存储中的主题设置
  const savedTheme = localStorage.getItem('theme');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // 设置初始主题 - 默认使用深色模式
  let currentTheme;
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    currentTheme = 'light';
  } else {
    // 默认使用深色模式
    document.documentElement.setAttribute('data-theme', 'dark');
    currentTheme = 'dark';
    // 如果没有保存过主题设置，将深色模式保存到本地存储
    if (!savedTheme) {
      localStorage.setItem('theme', 'dark');
    }
  }
});
