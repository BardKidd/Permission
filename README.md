# CASL 權限模組設計

摘要：需要設計一套權限模組，該權限模組僅有三種權限：讀寫、讀取、無權限。

> 本權限模組設計時有幾個想法：
>
> 1. 只有可讀和可讀寫判斷，沒有權限的話資料元甚至不會將物件傳過來
> 2. 方便好用，其他開發者容易理解前人寫的架構
> 3. 容易擴充，未來有除了可讀可讀寫外的情況很容易去添加

> 透過 CASL 套件來輕鬆建立，該套件的宗旨為讓 User 定義「可以做什麼」，所以當沒有設定時就預設為「不可以做什麼」。

本教學透過 context 來傳遞權限而不使用其他狀態管理工具。

## Step 0: 安裝套件

> 筆者在開發時並沒有特別指定版本，只是直接下指令安裝最新版而已。

```json
"dependencies": {
    "@casl/ability": "^6.7.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.0"
  },
```

## Step 1: 準備 context 結構

首先，建立一個 `context`。  
以下是建立 `context` 的固定寫法，不同的是這裡的寫法我想要讓他看起來更明確的是使用一個權限相關的 hook，所以再額外包一層讓他變成 `useAbility`。

```js
// src/context/index.js
import { createContext, useContext } from 'react';

export const AbilityContext = createContext(null);
export const useAbility = () => useContext(AbilityContext);
```

接著將 context 加入最外層的 App 元件中。

```js
// App.js
import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AbilityContext } from '@/context';
import AppRoutes from '@/routes';

function App() {
  // 這裡假設權限透過 API 取得後存放裡了。
  const [userPermissions, setUserPermissions] = useState([
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
    // other...
  ]);

  return (
    <BrowserRouter>
      <AbilityContext.Provider>
        <AppRoutes />
      </AbilityContext.Provider>
    </BrowserRouter>
  );
}
```

## Step 2: 準備權限判斷邏輯

做完第一步後可以發現 `Provider` 內容是空的，所以我們需要將邏輯判斷寫進去。

CASL 提供 `defineAbility` 這個方法來定義權限。`defineAbility` 有 `can` 和 `cannot` 來輕鬆指定什麼什麼可以做什麼不能做。  
但在這裡我們只會用到 `can` 方法，因為 CASL 採用的是「預設禁止」的策略，所以不寫 `cannot` 也會預設禁止。

再繼續下去之前這裡先插個範例，說明 `defineAbility` 的用法。

```js
import { defineAbility } from '@casl/ability';

defineAbility((can, cannot) => {
  can('read', 'Home');
  cannot('update', 'Home');
});
```

上面的範例定義了：

- 可以讀取 Home 頁面
- 不能更新 Home 頁面

通常我們會說第一個參數是 `action`，第二個參數是 `subject`。  
除了 read 和 update 外其他還有 create、delete、manage 等等。

> 注意：manage 是全部權限都有的用法。

回來我們的程式碼，我的想法是將權限作為參數傳入 `defineAbility`，然後在裡面做判斷。

```js
// src/utility/defineAbility.js
import { defineAbility } from '@casl/ability';

export default function defineAbilityForUser(userPermissions = []) {
  return defineAbility((can) => {
    userPermissions.forEach((permission) => {
      switch (permission.level) {
        case 'read':
          can('read', permission.subject);
          break;
        case 'edit':
          can('manage', permission.subject);
          break;
      }
    });
  });
}
```

將寫好的 `defineAbilityForUser` 引入到 `Provider` 中，並將權限傳入。

```js
<BrowserRouter>
  <AbilityContext.Provider value={defineAbilityForUser(userPermissions)}>
    <AppRoutes />
  </AbilityContext.Provider>
</BrowserRouter>
```

這步驟結束後之後我們想要使用權限判斷的時候就可以直接使用 `useAbility` 來取得權限了。

## Step 3: 頁面權限判斷

通常我的業務是開發公司內部系統，正常架構下就是左側會有個選單，點擊後就會跳到對應的頁面。  
所以我會想要將權限放在頁面的元件上，假如有權限就顯示該元件，否則就跳到無權限的頁面。

期望的寫法會是這樣：

```js
export default withPageAccess('About')(About);
```

先判斷了 `withPageAccess('About')` 是否可行後再執行 `(About)` 渲染元件。

而這個 `withPageAccess` 是什麼？

接下來這裡才是重頭戲，看不懂或還是很難理解的話其實很正常，以後慢慢把 HOC 的概念搞懂就好。

先附上全部程式碼瀏覽一下

```js
// src/components/PageAccess.jsx
import { useAbility } from '@/context';
import { Navigate } from 'react-router-dom';

export function withPageAccess(pageName, action = 'read') {
  return function withPageAccessHOC(WrappedComponent) {
    function ProtectedPage(props) {
      const ability = useAbility();

      if (!ability?.can(action, pageName)) {
        return <Navigate to="/unauthorized" />;
      }

      return <WrappedComponent {...props} />;
    }

    // 這個是讓 React DevTools 可以顯示指定名稱的東西，不寫也沒關係，但是 ESLint 會有紅色波浪一直跳出來...
    ProtectedPage.displayName = `WithPageAccess(${WrappedComponent.name})`;

    return ProtectedPage;
  };
}
```

> HOC 指的是高階元件，定義是傳入一個元件並且回傳一個元件。

在 `withPageAccess` 這整個 function 中，真正的 HOC 指的是 `withPageAccessHOC` 這個 function。  
而 `withPageAccess` 這個更外層的內容其實只是再多包一層的結構。

先來看看 `withPageAccessHOC` 這個 function 是否有符合 HOC 的定義：

```js
function withPageAccessHOC(WrappedComponent) {
  function ProtectedPage(props) {
    // ... other code

    if (...) {
      return <Navigate to="/unauthorized" />;
    }

    return <WrappedComponent {...props} />;
  }
  return ProtectedPage;
}
```

可以看到他最後 `return` 了 `ProtectedPage`，而 `ProtectedPage` 則是根據權限判斷返回了元件。所以這是一個標準的 HOC。

所以總的來說在上面的例子中：

`About` 是 `WrappedComponent`  
`ProtectedPage` 是包裝後的新元件

在整個工作流程中

1. `withPageAccess('About')` 返回一個 HOC。
2. 該 HOC 接收 `About` 作為 `WrappedComponent`。
3. 該 HOC 同時也返回一個 `ProtectedPage` 元件，顯示對應權限應該顯示的內容。

這步驟處理完權限就處理完了，現在假如你把權限 About 物件註解掉，再直接輸入網址前往 /about 理應跳出無權限的頁面。

但前端工作必須考慮到 User 操作，基本上不會透過網址來操作切換頁面，所以我們會製作按鈕來切換頁面，這時候按鈕也必須要綁上權限判斷才行。

## Step 4: 小元件綁定權限

這是一個非常普通的路由架構：

```js
import { Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import Unauthorized from './pages/Unauthorized';

export default function AppRoutes() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/about" element={<About />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}
```

你可以看到你有兩個按鈕，分別前往 `/` 和 `/about`，這時候你希望沒權限的話 About 的按鈕要是不可點擊的狀態。

這時你就需要額外寫個元件來處理樣式以及權限判斷了。

```js
// src/components/PermissionLink
import { Link } from 'react-router-dom';
import { useAbility } from '../contexts';

export function PermissionLink({ to, subject, children }) {
  const ability = useAbility();
  const canAccess =
    ability?.can('read', subject) || ability?.can('manage', subject);

  const styles = {
    pointerEvents: canAccess ? 'auto' : 'none',
    opacity: canAccess ? 1 : 0.5,
    textDecoration: 'none',
    marginRight: '1rem',
  };

  return (
    <Link to={to} style={styles}>
      {children}
    </Link>
  );
}
```

這個檔案做了以下幾件事情：

1. 包裝 `Link` 元件
2. 取用 context 的值來實現權限判斷
3. 設計不可點擊的樣式。

最後再將路由檔案的 `Link` 改為 `PermissionLink` 並傳一傳相關參數即可。

---

以上就是簡單的權限模組設計了，假如不介意一直用 context 的話其實那段 HOC 的內容也就不用寫了。  
但是在公司裡面除了自己以外也有可能也其他同事，為了讓他人方便設定該頁面是否有權限判斷，只好麻煩一點將它打包起來了。
