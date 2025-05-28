/**
 * 认证中间件
 * 用于保护需要登录才能访问的路由
 */

/**
 * 检查用户是否已认证
 * 如果未认证，重定向到登录页面
 */
function isAuthenticated(req, res, next) {
  console.log('认证检查:');
  console.log('- 请求路径:', req.path);
  console.log('- 会话 ID:', req.session?.id);
  console.log('- 会话认证状态:', req.session?.isAuthenticated);
  console.log('- 用户类型:', req.session?.userType);
  console.log('- Cookie 认证状态:', req.cookies?.auth);
  console.log('- 认证功能启用:', req.app.locals.config.authEnabled);

  // 如果认证功能未启用，直接通过
  if (!req.app.locals.config.authEnabled) {
    console.log('- 认证功能未启用，直接通过');
    return next();
  }

  // 检查会话中是否有认证标记
  if (req.session && req.session.isAuthenticated) {
    console.log('- 会话认证成功，允许访问');
    return next();
  }

  // 检查 Cookie 中是否有认证标记
  if (req.cookies && req.cookies.auth === 'true') {
    console.log('- Cookie 认证成功，允许访问');
    // 如果只有 Cookie 认证成功，同步到会话
    req.session.isAuthenticated = true;
    // 注意：从Cookie恢复时无法确定用户类型，默认为普通用户
    req.session.userType = req.session.userType || 'user';
    return next();
  }

  // 未认证，重定向到登录页面
  console.log('- 未认证，重定向到登录页面');
  res.redirect('/login');
}

/**
 * 检查用户是否为管理员
 * 如果不是管理员，返回403错误
 */
function isAdmin(req, res, next) {
  console.log('管理员权限检查:');
  console.log('- 用户类型:', req.session?.userType);
  console.log('- 认证状态:', req.session?.isAuthenticated);

  // 如果认证功能未启用，直接通过
  if (!req.app.locals.config.authEnabled) {
    console.log('- 认证功能未启用，直接通过');
    return next();
  }

  // 首先检查是否已认证
  if (!req.session || !req.session.isAuthenticated) {
    console.log('- 用户未认证，重定向到登录页面');
    return res.redirect('/login');
  }

  // 检查是否为管理员
  if (req.session.userType === 'admin') {
    console.log('- 管理员权限验证成功');
    return next();
  }

  // 不是管理员，返回403错误
  console.log('- 权限不足，拒绝访问');
  res.status(403).render('error', {
    title: '权限不足',
    message: '您没有权限访问此页面'
  });
}

module.exports = {
  isAuthenticated,
  isAdmin
};
