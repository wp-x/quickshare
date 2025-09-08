const { run, get, query } = require('./db');
const CryptoJS = require('crypto-js');

/**
 * 生成随机密码（5位纯数字）
 * @returns {string} 返回5位纯数字密码
 */
function generateRandomPassword() {
  const chars = '0123456789';
  let password = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  console.log('生成密码:', password); // 调试输出
  return password;
}

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

/**
 * 创建新页面
 * @param {string} htmlContent HTML内容
 * @param {boolean} isProtected 是否启用密码保护
 * @param {string} codeType 代码类型（html, markdown, svg, mermaid）
 * @returns {Promise<Object>} 返回生成的URL ID和密码
 */
async function createPage(htmlContent, isProtected = false, codeType = 'html') {
  try {
    // 生成时间戳
    const timestamp = new Date().getTime().toString();
    
    // 生成短ID (7位)
    const hash = CryptoJS.MD5(htmlContent + timestamp).toString();
    const urlId = hash.substring(0, 7);
    
    // 无论是否启用保护，都生成密码
    const password = generateRandomPassword();
    console.log('生成密码:', password);
    
    // 提取页面标题
    const title = extractTitle(htmlContent);
    console.log('提取标题:', title);
    
    // 保存到数据库
    // isProtected决定是否需要密码才能访问
    await run(
      'INSERT INTO pages (id, html_content, created_at, password, is_protected, code_type, title) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [urlId, htmlContent, Date.now(), password, isProtected ? 1 : 0, codeType, title]
    );
    
    return { urlId, password };
  } catch (error) {
    console.error('创建页面错误:', error);
    throw error;
  }
}

/**
 * 通过ID获取页面
 * @param {string} id 页面ID
 * @returns {Promise<Object|null>} 返回页面对象或null
 */
async function getPageById(id) {
  try {
    return await get('SELECT * FROM pages WHERE id = ?', [id]);
  } catch (error) {
    console.error('获取页面错误:', error);
    throw error;
  }
}

/**
 * 获取最近创建的页面列表
 * @param {number} limit 限制数量
 * @returns {Promise<Array>} 返回页面列表
 */
async function getRecentPages(limit = 10) {
  try {
    return await query(
      'SELECT id, created_at FROM pages ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
  } catch (error) {
    console.error('获取最近页面错误:', error);
    throw error;
  }
}

/**
 * 获取所有页面（分页）
 * @param {number} page 页码
 * @param {number} limit 每页数量
 * @param {string} search 搜索关键词
 * @returns {Promise<Object>} 返回页面列表和分页信息
 */
async function getAllPages(page = 1, limit = 10, search = '') {
  try {
    const offset = (page - 1) * limit;
    let whereClause = '';
    let params = [];
    
    if (search) {
      whereClause = 'WHERE id LIKE ? OR title LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    
    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM pages ${whereClause}`;
    const countResult = await get(countQuery, params);
    const total = countResult.total;
    
    // 获取页面列表
    const pagesQuery = `
      SELECT id, created_at, is_protected, code_type, title, password
      FROM pages 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const pagesParams = [...params, limit, offset];
    const pages = await query(pagesQuery, pagesParams);
    
    // 格式化数据
    const formattedPages = pages.map(page => ({
      ...page,
      created_at_formatted: new Date(page.created_at).toLocaleString('zh-CN'),
      is_protected: !!page.is_protected
    }));
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      pages: formattedPages,
      total,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.error('获取所有页面错误:', error);
    throw error;
  }
}

/**
 * 删除页面
 * @param {string} id 页面ID
 * @returns {Promise<boolean>} 返回是否删除成功
 */
async function deletePageById(id) {
  try {
    const result = await run('DELETE FROM pages WHERE id = ?', [id]);
    return result.changes > 0;
  } catch (error) {
    console.error('删除页面错误:', error);
    throw error;
  }
}

/**
 * 批量删除页面
 * @param {Array<string>} ids 页面ID数组
 * @returns {Promise<Object>} 返回删除结果
 */
async function batchDeletePages(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { deletedCount: 0 };
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const query_str = `DELETE FROM pages WHERE id IN (${placeholders})`;
    const result = await run(query_str, ids);
    
    return { deletedCount: result.changes };
  } catch (error) {
    console.error('批量删除页面错误:', error);
    throw error;
  }
}

/**
 * 获取统计信息
 * @returns {Promise<Object>} 返回统计数据
 */
async function getStats() {
  try {
    console.log('开始获取统计信息...');
    
    // 总页面数
    console.log('查询总页面数...');
    const totalResult = await get('SELECT COUNT(*) as total FROM pages');
    const total = totalResult.total;
    console.log('总页面数:', total);
    
    // 受保护的页面数
    console.log('查询受保护页面数...');
    const protectedResult = await get('SELECT COUNT(*) as protected FROM pages WHERE is_protected = 1');
    const protected_count = protectedResult.protected;
    console.log('受保护页面数:', protected_count);
    
    // 按代码类型统计
    console.log('查询代码类型统计...');
    const typeStats = await query(`
      SELECT code_type, COUNT(*) as count 
      FROM pages 
      GROUP BY code_type 
      ORDER BY count DESC
    `);
    console.log('代码类型统计:', typeStats);
    
    // 最近7天创建的页面数
    console.log('查询最近7天页面数...');
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentResult = await get('SELECT COUNT(*) as recent FROM pages WHERE created_at > ?', [sevenDaysAgo]);
    const recent_count = recentResult.recent;
    console.log('最近7天页面数:', recent_count);
    
    // 今天创建的页面数
    console.log('查询今天页面数...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const todayResult = await get('SELECT COUNT(*) as today FROM pages WHERE created_at > ?', [todayTimestamp]);
    const today_count = todayResult.today;
    console.log('今天页面数:', today_count);
    
    const stats = {
      total,
      protected_count,
      unprotected_count: total - protected_count,
      recent_count,
      today_count,
      type_stats: typeStats
    };
    
    console.log('统计信息获取成功:', stats);
    return stats;
  } catch (error) {
    console.error('获取统计信息错误 - 详细信息:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  createPage,
  getPageById,
  getRecentPages,
  getAllPages,
  deletePageById,
  batchDeletePages,
  getStats
};
