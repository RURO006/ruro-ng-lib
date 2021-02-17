# 新增 libirary

ng g library <name>

# 設定 package

package.json name 要加@goldenapple

# 設定移除不必要的檔案(可以不做)

到<name>/src/lib 裡面移除掉沒用到的檔案，例如這是個 component 套件，則 service.ts 就可以移除
到<name>/public-api.ts 裡面移除沒用到的程式碼，例如這是 service 套件，則只保留 export \* from './lib/<name>.service';

# 編譯

ng build <name> --prod
編譯出現錯誤"operation not permitted, unlink"時再一次就可以成功了。

# 發佈到 npm

cd dist/<name>
npm publish --access public
