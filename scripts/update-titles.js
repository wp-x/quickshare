// 更新现有页面标题的脚本
const { db, query, run } = require('../models/db');

/**
 * 提取HTML内容中的title标签
 * @param {string} htmlContent HTML内容
 * @returns {string} 提取的标题，如果没有则返回默认值
 */
function extractTitle(htmlContent) {
  try {
    // 匹配 <title>...</title> 标签，忽略大小写
    const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      // 去除HTML实体和多余空白
      return titleMatch[1].trim().replace(/&[^;]+;/g, '').substring(0, 100);
    }
    
    // 如果没有title标签，尝试提取第一个h1标签
    const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      return h1Match[1].trim().replace(/<[^>]*>/g, '').substring(0, 100);
    }
    
    // 如果都没有，返回内容的前50个字符作为标题
    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (textContent.length > 0) {
      return textContent.substring(0, 50) + (textContent.length > 50 ? '...' : '');
    }
    
    return '无标题';
  } catch (error) {
    console.error('提取标题错误:', error);
    return '无标题';
  }
}

async function updateTitles() {
  try {
    console.log('开始更新页面标题...');
    
    // 获取所有没有标题或标题为空的页面
    const pages = await query('SELECT id, html_content FROM pages WHERE title IS NULL OR title = "" OR title = "无标题"');
    
    console.log(`找到 ${pages.length} 个需要更新标题的页面`);
    
    let updatedCount = 0;
    
    for (const page of pages) {
      const title = extractTitle(page.html_content);
      
      try {
        await run('UPDATE pages SET title = ? WHERE id = ?', [title, page.id]);
        console.log(`更新页面 ${page.id} 的标题: ${title}`);
        updatedCount++;
      } catch (error) {
        console.error(`更新页面 ${page.id} 标题失败:`, error);
      }
    }
    
    console.log(`成功更新了 ${updatedCount} 个页面的标题`);
    
  } catch (error) {
    console.error('更新标题过程中出错:', error);
  } finally {
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接时出错:', err);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateTitles();
}

module.exports = { updateTitles, extractTitle }; 