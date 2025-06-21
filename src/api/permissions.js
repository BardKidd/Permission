// 模擬權限 API 服務
const mockPermissionData = [
  {
    page: 'Main',
    subPage: [
      {
        action: 'edit',
        pageNumber: 'A01',
        subject: 'A01',
        path: 'main',
        order: '1',
      },
    ],
  },
  {
    page: 'About',
    subPage: [
      {
        action: 'edit',
        pageNumber: 'B01',
        subject: 'B01',
        path: 'about/b01',
        order: '1',
      },
      {
        action: 'read',
        pageNumber: 'B02',
        subject: 'B02',
        path: 'about/b02',
        order: '2',
      },
      {
        action: 'edit',
        pageNumber: 'B03',
        subject: 'B03',
        path: 'about/b03',
        order: '3',
      },
    ],
  },
  {
    page: 'Product',
    subPage: [
      {
        action: 'read',
        pageNumber: 'C01',
        subject: 'C01',
        path: 'product/c01',
        order: '1',
      },
      {
        action: 'edit',
        pageNumber: 'C02',
        subject: 'C02',
        path: 'product/c02',
        order: '2',
      },
      // C03 故意移除，模擬沒有權限的情況
    ],
  },
];

/**
 * 模擬從 API 獲取使用者權限
 * @param {string} userId - 使用者 ID（可選）
 * @returns {Promise<Array>} 返回權限列表的 Promise
 */
export const fetchUserPermissions = async (userId = 'default') => {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // 模擬不同使用者有不同權限
  if (userId === 'readonly') {
    // 只讀使用者
    return mockPermissionData.map(permission => ({
      ...permission,
      subPage: permission.subPage.map(item => ({
        ...item,
        action: 'read'
      }))
    }));
  }
  
  if (userId === 'limited') {
    // 受限使用者，只有部分權限
    return mockPermissionData.slice(0, 2);
  }
  
  // 模擬 API 失敗的情況（5% 機率）
  if (Math.random() < 0.05) {
    throw new Error('Failed to fetch user permissions');
  }
  
  return mockPermissionData;
};

/**
 * 轉換權限資料為扁平結構
 * @param {Array} permissions - 原始權限資料
 * @returns {Array} 扁平化的權限列表
 */
export const flattenPermissions = (permissions) => {
  return permissions.flatMap(permission => 
    permission.subPage.map(item => item)
  );
};